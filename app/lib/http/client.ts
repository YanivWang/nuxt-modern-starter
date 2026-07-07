/*
  【文件职责】
    通用 API client 工厂：基于 $fetch 封装请求、信封校验、401 时可选重试一次。
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
    仅当响应为 ApiResponse 信封时才 assertApiSuccess；非信封 JSON 原样返回。
    401 重试仅执行一次，避免 refresh 死循环。
*/
import type { ApiClientOptions, ApiRequestOptions, ApiResponse } from './types'
import { createHeaders } from './headers'
import { assertApiSuccess, isUnauthorizedError } from './error'

const isApiEnvelope = (result: unknown): result is ApiResponse<unknown> =>
  Boolean(
    result &&
    typeof result === 'object' &&
    'code' in result &&
    typeof (result as ApiResponse<unknown>).code === 'number'
  )

type FetchRequest = Parameters<typeof $fetch>[0]

const toFetchOptions = (options: ApiRequestOptions & { baseURL: string; headers: Headers }) =>
  options as NonNullable<Parameters<typeof $fetch>[1]>

export const createApiClient = ({
  baseURL,
  headers: baseHeaders,
  fetcher = $fetch,
  onUnauthorized
}: ApiClientOptions) => {
  const request = async <T>(path: FetchRequest, options: ApiRequestOptions = {}) => {
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
      const result = await fetcher<T>(path, toFetchOptions(fetchOptions))

      if (isApiEnvelope(result)) {
        assertApiSuccess(result)
      }

      return result
    } catch (error) {
      if (!onUnauthorized || !isUnauthorizedError(error)) {
        throw error
      }

      const nextHeaders = await onUnauthorized()

      if (!nextHeaders) {
        throw error
      }

      // 401 单飞 refresh 成功后，用新 token headers 重试原请求一次
      const retryHeaders = createHeaders(headers)

      createHeaders(nextHeaders).forEach((value, key) => {
        retryHeaders.set(key, value)
      })

      const result = await fetcher<T>(
        path,
        toFetchOptions({
          ...fetchOptions,
          headers: retryHeaders
        })
      )

      if (isApiEnvelope(result)) {
        assertApiSuccess(result)
      }

      return result
    }
  }

  return { request }
}
