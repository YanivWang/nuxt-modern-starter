import type { ApiClientOptions } from '../../api-core/api-types'
import { createBearerHeaders } from '../../api-core/api-headers'
import { createApiClient } from '../../api-core/create-api-client'

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
