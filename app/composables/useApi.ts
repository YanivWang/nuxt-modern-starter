import type { UseFetchOptions } from 'nuxt/app'
import { refreshAccessTokenOnce } from '../apis/auth'
import type { ApiResponse } from '../utils/api-contract'
import { getAuthToken } from '../utils/auth-session'

export type ApiError = {
  statusCode: number
  message: string
}

type ApiMethod = 'GET' | 'POST' | 'PATCH'

type ApiBody = string | Record<string, unknown> | FormData | URLSearchParams | null

type MutableFetchOptions = {
  method?: string
  baseURL?: string
  body?: unknown
  headers?: HeadersInit
  [key: string]: unknown
}

type FetchRequest = Parameters<typeof $fetch>[0]

type ApiOptions<T> = Omit<
  UseFetchOptions<ApiResponse<T>>,
  'method' | 'key' | 'headers' | 'body'
> & {
  method?: ApiMethod
  body?: ApiBody
  token?: string
  key?: string
  headers?: HeadersInit
}

const sanitizeHeaders = (headers: HeadersInit = {}) => {
  const normalizedHeaders = new Headers(headers)

  for (const key of ['authorization', 'cookie']) {
    if (normalizedHeaders.has(key)) {
      normalizedHeaders.set(key, '[redacted]')
    }
  }

  return Object.fromEntries(normalizedHeaders.entries())
}

const createApiKey = (method: ApiMethod, path: string, body?: unknown) => {
  const bodyKey = body ? JSON.stringify(body) : ''
  return `api:${method}:${path}:${bodyKey}`
}

const isUnauthorizedError = (error: unknown) => {
  const fetchError = error as { response?: { status?: number }; statusCode?: number }
  return fetchError.response?.status === 401 || fetchError.statusCode === 401
}

const toFetchOptions = (options: MutableFetchOptions) =>
  options as unknown as NonNullable<Parameters<typeof $fetch>[1]>

const createAuthenticatedFetch = (baseHeaders: Headers, explicitToken?: string): typeof $fetch => {
  let hasRetried = false

  const apiFetch = async <T>(request: FetchRequest, fetchOptions: MutableFetchOptions = {}) => {
    const requestHeaders = new Headers(fetchOptions.headers || baseHeaders)

    try {
      return await $fetch<T>(
        request,
        toFetchOptions({
          ...fetchOptions,
          headers: requestHeaders
        })
      )
    } catch (error) {
      if (explicitToken || hasRetried || !isUnauthorizedError(error)) {
        throw error
      }

      hasRetried = true
      const nextAccessToken = await refreshAccessTokenOnce()

      if (!nextAccessToken) {
        throw error
      }

      requestHeaders.set('authorization', `Bearer ${nextAccessToken}`)

      return $fetch<T>(
        request,
        toFetchOptions({
          ...fetchOptions,
          headers: requestHeaders
        })
      )
    }
  }

  return apiFetch as typeof $fetch
}

export const useApi = <T>(path: string, options: ApiOptions<T> = {}) => {
  const runtimeConfig = useRuntimeConfig()
  const method = options.method || 'GET'
  const baseURL = runtimeConfig.public.apiBase
  const headers = new Headers(options.headers)

  const token = options.token || getAuthToken()

  if (token) {
    headers.set('authorization', `Bearer ${token}`)
  }

  return useFetch<ApiResponse<T>>(path, {
    ...options,
    method,
    baseURL,
    body: options.body,
    headers,
    $fetch: createAuthenticatedFetch(headers, options.token),
    key: options.key || createApiKey(method, path, options.body),
    onResponseError({ response }) {
      const error: ApiError = {
        statusCode: response.status,
        message: response.statusText || 'Request failed'
      }

      console.error('[useApi] request failed', {
        path,
        method,
        headers: sanitizeHeaders(headers),
        statusCode: error.statusCode
      })

      throw createError(error)
    }
  })
}

export const useApiPost = <T>(path: string, body?: ApiBody, options: ApiOptions<T> = {}) =>
  useApi<T>(path, {
    ...options,
    method: 'POST',
    body
  })
