import type { UseFetchOptions } from 'nuxt/app'
import type { ApiClientKind } from '../api-core/api-types'
import { createBearerHeaders, createHeaders, sanitizeHeaders } from '../api-core/api-headers'
import { createApiFailure, isUnauthorizedError } from '../api-core/api-error'
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

export type ApiOptions<T> = Omit<
  UseFetchOptions<ApiResponse<T>>,
  'method' | 'key' | 'headers' | 'body'
> & {
  method?: ApiMethod
  body?: ApiBody
  token?: string
  key?: string
  headers?: HeadersInit
}

export const createScenarioApiKey = (
  kind: ApiClientKind,
  method: ApiMethod,
  path: string,
  body?: unknown
) => {
  const bodyKey = body ? JSON.stringify(body) : ''
  return `api:${kind}:${method}:${path}:${bodyKey}`
}

export const createPublicApiHeaders = (headers: HeadersInit = {}) => createHeaders(headers)

export const createAuthenticatedApiHeaders = (token?: string | null, headers: HeadersInit = {}) =>
  createBearerHeaders(token, headers)

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

export const requestScenarioApi = <T>(
  kind: ApiClientKind,
  path: string,
  options: ApiOptions<T> = {},
  headers: Headers,
  shouldRefreshOnUnauthorized: boolean
) => {
  const runtimeConfig = useRuntimeConfig()
  const method = options.method || 'GET'
  const baseURL = runtimeConfig.public.apiBase

  return useFetch<ApiResponse<T>>(path, {
    ...options,
    method,
    baseURL,
    body: options.body,
    headers,
    $fetch: shouldRefreshOnUnauthorized ? createAuthenticatedFetch(headers, options.token) : $fetch,
    key: options.key || createScenarioApiKey(kind, method, path, options.body),
    onResponseError({ response }) {
      const error = createApiFailure({
        statusCode: response.status,
        message: response.statusText || 'Request failed'
      }) as ApiError

      console.error('[useApi] request failed', {
        kind,
        path,
        method,
        headers: sanitizeHeaders(headers),
        statusCode: error.statusCode
      })

      throw createError(error)
    }
  })
}

export const useApi = <T>(path: string, options: ApiOptions<T> = {}) => {
  const token = options.token || getAuthToken()
  const headers = createAuthenticatedApiHeaders(token, options.headers)

  return requestScenarioApi('auth', path, options, headers, true)
}

export const useApiPost = <T>(path: string, body?: ApiBody, options: ApiOptions<T> = {}) =>
  useApi<T>(path, {
    ...options,
    method: 'POST',
    body
  })
