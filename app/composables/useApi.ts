import type { UseFetchOptions } from 'nuxt/app'
import { refreshApi } from '../apis/auth'
import {
  ACCESS_TOKEN_MAX_AGE,
  AUTH_COOKIE_KEYS,
  REFRESH_TOKEN_MAX_AGE
} from '../../config/auth'

export type ApiResponse<T> = {
  code: number
  message: string
  data: T
}

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

export const FORWARDED_HEADER_WHITELIST = [
  'cookie',
  'authorization',
  'x-request-id',
  'accept-language'
] as const

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

const getForwardedHeaders = () => {
  if (!import.meta.server) {
    return {}
  }

  return useRequestHeaders([...FORWARDED_HEADER_WHITELIST])
}

let refreshPromise: Promise<string | null> | null = null

const tokenCookieOptions = (maxAge: number) => ({
  maxAge,
  sameSite: 'lax' as const,
  path: '/'
})

const getAccessTokenCookie = () =>
  useCookie<string | null>(AUTH_COOKIE_KEYS.accessToken, tokenCookieOptions(ACCESS_TOKEN_MAX_AGE))

const getRefreshTokenCookie = () =>
  useCookie<string | null>(AUTH_COOKIE_KEYS.refreshToken, tokenCookieOptions(REFRESH_TOKEN_MAX_AGE))

const getAuthToken = () => getAccessTokenCookie().value

const isUnauthorizedError = (error: unknown) => {
  const fetchError = error as { response?: { status?: number }; statusCode?: number }
  return fetchError.response?.status === 401 || fetchError.statusCode === 401
}

const clearAuthSession = () => {
  getAccessTokenCookie().value = null
  getRefreshTokenCookie().value = null

  try {
    useAuthStore().reset()
  } catch {
    // Pinia may not be active in isolated utility tests.
  }
}

const refreshAccessToken = async () => {
  const refreshToken = getRefreshTokenCookie()

  if (!refreshToken.value) {
    clearAuthSession()
    return null
  }

  try {
    const response = await refreshApi(refreshToken.value)
    const nextAccessToken = response.accessToken || response.token || null

    if (!nextAccessToken) {
      clearAuthSession()
      return null
    }

    getAccessTokenCookie().value = nextAccessToken
    refreshToken.value = response.refreshToken
    return nextAccessToken
  } catch (error) {
    clearAuthSession()
    throw error
  }
}

const refreshAccessTokenOnce = () => {
  refreshPromise ||= refreshAccessToken().finally(() => {
    refreshPromise = null
  })

  return refreshPromise
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
  const isServer = import.meta.server
  const baseURL = isServer ? runtimeConfig.apiBase : runtimeConfig.public.apiBase
  const headers = new Headers({
    ...getForwardedHeaders(),
    ...options.headers
  })

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
