import type { FetchOptions } from 'ofetch'

export type ApiResponse<T> = {
  code: number
  message: string
  data: T
}

export type ApiClientKind = 'public' | 'auth' | 'editor' | 'server'

export type ApiRequestOptions = Omit<FetchOptions<'json'>, 'baseURL' | 'headers'> & {
  headers?: HeadersInit
}

export type ApiClientOptions = {
  kind?: ApiClientKind
  baseURL: string
  headers?: HeadersInit
  fetcher?: typeof $fetch
  onUnauthorized?: () => Promise<HeadersInit | null | undefined>
}
