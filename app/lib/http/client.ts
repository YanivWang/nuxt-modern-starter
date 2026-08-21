/*
  【文件职责】
    通用 API client 工厂：基于 $fetch 封装请求、标准信封校验、401 时可选重试一次。
    createApiClient 是所有 Public / Auth / Product client 的底层实现。

  【架构位置】
    共享层 — app/lib/http，被 app/api/clients.ts 消费。

  【主要导出 / 路由】
    createApiClient

  【依赖关系】
    - 依赖：headers.ts、error.ts、types.ts
    - 被引用：app/api/clients.ts

  【渲染 / 数据】
    SSR 与 CSR 均可使用；401 重试逻辑由 onUnauthorized 回调提供新 headers。

  【边界与注意】
    所有业务 API 响应必须为 ApiResponse 信封；非信封响应直接视为后端契约错误。
    401 重试仅执行一次，避免 refresh 死循环。
*/
import type { ApiClientOptions, ApiRequestOptions, ApiResponse } from './types'
import { createHeaders } from './headers'
import { assertApiSuccess, createApiError, isUnauthorizedError, normalizeApiError } from './error'

/** 判断响应是否为 { code, message, data } 标准业务信封 */
const isApiEnvelope = (result: unknown): result is ApiResponse<unknown> =>
  Boolean(
    result &&
    typeof result === 'object' &&
    'code' in result &&
    typeof (result as ApiResponse<unknown>).code === 'number' &&
    'message' in result &&
    typeof (result as ApiResponse<unknown>).message === 'string' &&
    'data' in result
  )

const assertApiEnvelope = (result: unknown): ApiResponse<unknown> => {
  if (!isApiEnvelope(result)) {
    throw createApiError({ message: 'Invalid API response envelope' })
  }

  return result
}

type FetchRequest = Parameters<typeof $fetch>[0]

/** 将内部 fetchOptions 断言为 $fetch 第二参数类型（ofetch FetchOptions 结构兼容） */
const toFetchOptions = (options: ApiRequestOptions & { baseURL: string; headers: Headers }) =>
  options as NonNullable<Parameters<typeof $fetch>[1]>

export const createApiClient = ({
  baseURL,
  headers: baseHeaders,
  fetcher = $fetch,
  onUnauthorized
}: ApiClientOptions) => {
  const execute = async <T>(
    path: FetchRequest,
    fetchOptions: ApiRequestOptions & { baseURL: string; headers: Headers }
  ) => {
    try {
      const result = await fetcher<T>(path, toFetchOptions(fetchOptions))

      assertApiSuccess(assertApiEnvelope(result))

      return result
    } catch (error) {
      // HTTP 边界统一收口；边界外不泄漏 ofetch/raw object 错误形状。
      throw normalizeApiError(error)
    }
  }

  const request = async <T>(path: FetchRequest, options: ApiRequestOptions = {}) => {
    // 合并 client 级 baseHeaders 与单次请求 headers，后者覆盖同名 key
    const headers = createHeaders(baseHeaders)
    const requestHeaders = createHeaders(options.headers)

    requestHeaders.forEach((value, key) => {
      headers.set(key, value)
    })

    const fetchOptions = {
      ...options,
      baseURL,
      method: options.method || 'GET',
      headers
    }

    try {
      return await execute<T>(path, fetchOptions)
    } catch (error) {
      // execute 保证此处只会收到 ApiError；业务 code=401 与 HTTP 401 走同一条重试链。
      if (!onUnauthorized || !isUnauthorizedError(error)) {
        throw error
      }

      let nextHeaders: HeadersInit | null | undefined

      try {
        nextHeaders = await onUnauthorized()
      } catch (refreshError) {
        throw normalizeApiError(refreshError)
      }

      // refresh 失败（返回 null/undefined）时放弃重试，向上抛出原始 401
      if (!nextHeaders) {
        throw error
      }

      // 401 单飞 refresh 成功后，用新 token headers 重试原请求一次
      const retryHeaders = createHeaders(headers)

      createHeaders(nextHeaders).forEach((value, key) => {
        retryHeaders.set(key, value)
      })

      return execute<T>(path, {
        ...fetchOptions,
        headers: retryHeaders
      })
    }
  }

  return { request }
}
