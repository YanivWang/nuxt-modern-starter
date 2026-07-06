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
