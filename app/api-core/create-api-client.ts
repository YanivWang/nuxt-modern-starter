import type { ApiClientOptions, ApiRequestOptions } from './api-types'
import { createHeaders } from './api-headers'
import { isUnauthorizedError } from './api-error'

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
      return await fetcher<T>(path, toFetchOptions(fetchOptions))
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

      return fetcher<T>(
        path,
        toFetchOptions({
          ...fetchOptions,
          headers: retryHeaders
        })
      )
    }
  }

  return { request }
}
