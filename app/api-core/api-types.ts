import type { FetchOptions } from 'ofetch'

export type ApiResponse<T> = {
  code: number
  message: string
  data: T
}

export type FlatApiResponse = {
  code: number
  msg?: string
  message?: string
}

export type NormalizedFlatApiResponse<T extends FlatApiResponse> = Omit<T, 'msg' | 'message'> & {
  code: number
  message: string
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
