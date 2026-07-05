import type { FlatApiResponse, NormalizedFlatApiResponse } from './api-types'

export type ApiFailure = {
  statusCode: number
  message: string
}

export const normalizeFlatApiResponse = <T extends FlatApiResponse>(
  response: T
): NormalizedFlatApiResponse<T> => {
  const { msg, message, ...rest } = response

  return {
    ...rest,
    message: message || msg || ''
  } as NormalizedFlatApiResponse<T>
}

export const getApiErrorMessage = (error: unknown, fallback: string) => {
  const apiError = error as {
    data?: { message?: string; msg?: string }
    message?: string
  }

  return apiError.data?.message || apiError.data?.msg || apiError.message || fallback
}

export const createApiFailure = (input: Partial<ApiFailure> = {}): ApiFailure => ({
  statusCode: input.statusCode || 500,
  message: input.message || 'Request failed'
})

export const isUnauthorizedError = (error: unknown) => {
  const fetchError = error as { response?: { status?: number }; statusCode?: number }
  return fetchError.response?.status === 401 || fetchError.statusCode === 401
}
