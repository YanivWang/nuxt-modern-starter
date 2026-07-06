import type { ApiClientOptions } from '../lib/http/types'
import { createHeaders, createBearerHeaders } from '../lib/http/headers'
import { createApiClient } from '../lib/http/client'
import { DEFAULT_LOCALE, type SupportedLocale } from '../../config/site'

export type PublicApiClientOptions = Pick<ApiClientOptions, 'fetcher'> & {
  locale?: SupportedLocale
  headers?: HeadersInit
}

export const createPublicApiClient = (options: PublicApiClientOptions = {}) => {
  const runtimeConfig = useRuntimeConfig()
  const headers = createHeaders(options.headers)

  headers.delete('authorization')
  headers.delete('cookie')

  if (!headers.has('accept-language')) {
    headers.set('accept-language', options.locale || DEFAULT_LOCALE)
  }

  return createApiClient({
    baseURL: runtimeConfig.public.apiBase,
    headers,
    fetcher: options.fetcher
  })
}

export type AuthApiClientOptions = Pick<ApiClientOptions, 'fetcher'> & {
  accessToken?: string | null
  headers?: HeadersInit
  refreshAccessToken?: () => Promise<string | null | undefined>
}

export const createAuthApiClient = (options: AuthApiClientOptions = {}) => {
  const runtimeConfig = useRuntimeConfig()

  return createApiClient({
    baseURL: runtimeConfig.public.apiBase,
    headers: createBearerHeaders(options.accessToken, options.headers),
    fetcher: options.fetcher,
    onUnauthorized: options.refreshAccessToken
      ? async () => {
          const nextAccessToken = await options.refreshAccessToken?.()

          if (!nextAccessToken) {
            return null
          }

          return createBearerHeaders(nextAccessToken, options.headers)
        }
      : undefined
  })
}
