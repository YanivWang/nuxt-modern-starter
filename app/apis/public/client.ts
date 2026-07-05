import type { ApiClientOptions } from '../../api-core/api-types'
import { createHeaders } from '../../api-core/api-headers'
import { createApiClient } from '../../api-core/create-api-client'
import { DEFAULT_LOCALE, type SupportedLocale } from '../../../config/site'

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
