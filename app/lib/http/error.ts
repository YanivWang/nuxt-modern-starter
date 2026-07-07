/*
  【文件职责】
    API 错误处理：信封 code 校验、401 判定、用户可读 message 提取。
    assertApiSuccess 在 code !== 200 时抛出 ApiFailure。

  【架构位置】
    共享层 — app/lib/http，被 client.ts 与 feature adapter 间接使用。

  【主要导出 / 路由】
    assertApiSuccess、isUnauthorizedError、getApiErrorMessage、createApiFailure、ApiFailure

  【依赖关系】
    - 依赖：app/lib/http/types.ts
    - 被引用：app/lib/http/client.ts、UI 层 catch 块

  【渲染 / 数据】
    无

  【边界与注意】
    isUnauthorizedError 同时检查 response.status 与 statusCode，兼容 ofetch 错误形状。
*/
import type { ApiResponse } from './types'

export type ApiFailure = {
  statusCode: number
  message: string
}

export const createApiFailure = (input: Partial<ApiFailure> = {}): ApiFailure => ({
  statusCode: input.statusCode || 500,
  message: input.message || 'Request failed'
})

export const assertApiSuccess = <T>(response: ApiResponse<T>) => {
  if (response.code !== 200) {
    throw createApiFailure({ statusCode: response.code, message: response.message })
  }

  return response
}

export const getApiErrorMessage = (error: unknown, defaultMessage: string) => {
  const apiError = error as { data?: { message?: string } }

  return apiError.data?.message || defaultMessage
}

export const isUnauthorizedError = (error: unknown) => {
  const fetchError = error as { response?: { status?: number }; statusCode?: number }
  return fetchError.response?.status === 401 || fetchError.statusCode === 401
}
