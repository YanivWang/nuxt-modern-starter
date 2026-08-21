/*
  【文件职责】
    API 错误模型：将业务信封失败与 $fetch 传输失败统一为 ApiError。
    HTTP client 边界外只允许抛出 ApiError，UI 与鉴权逻辑不再识别多种错误形状。

  【架构位置】
    共享层 — app/lib/http，被 client.ts、auth 状态机与 UI catch 块使用。

  【主要导出 / 路由】
    ApiError、createApiError、normalizeApiError、assertApiSuccess、
    isUnauthorizedError、getApiErrorMessage

  【依赖关系】
    - 依赖：app/lib/http/types.ts
    - 被引用：app/lib/http/client.ts、auth store/composable、UI 层 catch 块

  【渲染 / 数据】
    无

  【边界与注意】
    normalizeApiError 只在 HTTP 边界将 ofetch 形状转换一次；其余层仅消费 ApiError。
*/
import type { ApiResponse } from './types'

type ApiErrorInput = {
  statusCode?: number
  message?: string
  cause?: unknown
}

type UnknownRecord = Record<string, unknown>

const isRecord = (value: unknown): value is UnknownRecord =>
  Boolean(value && typeof value === 'object')

const readNumber = (...values: unknown[]) =>
  values.find((value): value is number => typeof value === 'number' && Number.isFinite(value))

const readString = (...values: unknown[]) =>
  values.find((value): value is string => typeof value === 'string' && value.trim().length > 0)

export class ApiError extends Error {
  readonly statusCode: number

  constructor({ statusCode = 500, message = 'Request failed', cause }: ApiErrorInput = {}) {
    super(message, { cause })
    this.name = 'ApiError'
    this.statusCode = statusCode
  }
}

export const createApiError = (input: ApiErrorInput = {}) => new ApiError(input)

/**
 * 在 HTTP 边界把 ofetch 的 transport error 转成唯一 ApiError。
 * 业务信封的 code/message 优先于 HTTP status/statusText。
 */
export const normalizeApiError = (error: unknown) => {
  if (error instanceof ApiError) {
    return error
  }

  const fetchError = isRecord(error) ? error : {}
  const response = isRecord(fetchError.response) ? fetchError.response : {}
  const responseData = isRecord(response._data) ? response._data : {}
  const errorData = isRecord(fetchError.data) ? fetchError.data : responseData

  return createApiError({
    statusCode:
      readNumber(errorData.code, response.status, fetchError.statusCode, fetchError.status) ?? 500,
    message:
      readString(errorData.message, fetchError.statusMessage, response.statusText) ??
      'Request failed',
    cause: error
  })
}

/** 业务信封 code !== 200 时抛出唯一 ApiError，statusCode 使用业务 code */
export const assertApiSuccess = <T>(response: ApiResponse<T>) => {
  if (response.code !== 200) {
    throw createApiError({ statusCode: response.code, message: response.message })
  }

  return response
}

/** UI 只展示 HTTP 边界产出的 ApiError message；未知异常使用调用方文案 */
export const getApiErrorMessage = (error: unknown, defaultMessage: string) =>
  error instanceof ApiError ? error.message : defaultMessage

/** 鉴权层只识别规范化后的 ApiError，不再兼容 raw ofetch 或普通对象 */
export const isUnauthorizedError = (error: unknown) =>
  error instanceof ApiError && error.statusCode === 401
