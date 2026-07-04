import type { UseFetchOptions } from 'nuxt/app'

export type ApiResponse<T> = {
  code: number
  message: string
  data: T
}

export type ApiError = {
  statusCode: number
  message: string
}

type ApiMethod = 'GET' | 'POST'

type ApiBody = string | Record<string, unknown> | FormData | URLSearchParams | null

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

export const useApi = <T>(path: string, options: ApiOptions<T> = {}) => {
  const runtimeConfig = useRuntimeConfig()
  const method = options.method || 'GET'
  const isServer = import.meta.server
  const baseURL = isServer ? runtimeConfig.apiBase : runtimeConfig.public.apiBase
  const headers = new Headers({
    ...getForwardedHeaders(),
    ...options.headers
  })

  if (options.token) {
    headers.set('authorization', `Bearer ${options.token}`)
  }

  return useFetch<ApiResponse<T>>(path, {
    ...options,
    method,
    baseURL,
    body: options.body,
    headers,
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
