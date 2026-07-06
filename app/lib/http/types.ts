import type { FetchOptions } from 'ofetch'

export type ApiResponse<T> = {
  code: number
  message: string
  data: T
}

export type ApiRequestOptions = Omit<FetchOptions<'json'>, 'baseURL' | 'headers'> & {
  headers?: HeadersInit
}

export type ApiClientOptions = {
  baseURL: string
  headers?: HeadersInit
  fetcher?: typeof $fetch
  onUnauthorized?: () => Promise<HeadersInit | null | undefined>
}
