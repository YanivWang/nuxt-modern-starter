export type ApiFailure = {
  statusCode: number
  message: string
}

export const getApiErrorMessage = (error: unknown, defaultMessage: string) => {
  const apiError = error as {
    data?: { message?: string }
    message?: string
  }

  return apiError.data?.message || apiError.message || defaultMessage
}

export const createApiFailure = (input: Partial<ApiFailure> = {}): ApiFailure => ({
  statusCode: input.statusCode || 500,
  message: input.message || 'Request failed'
})

export const isUnauthorizedError = (error: unknown) => {
  const fetchError = error as { response?: { status?: number }; statusCode?: number }
  return fetchError.response?.status === 401 || fetchError.statusCode === 401
}
