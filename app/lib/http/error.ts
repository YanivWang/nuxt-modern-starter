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
