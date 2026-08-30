/*
  【文件职责】
    三类 API client 工厂：Public（剥 token）、Auth（Bearer + 可选 refresh）、Product 在 app/api/auth.ts。
    createPublicApiClient 强制删除 authorization / cookie，并注入 accept-language。

  【架构位置】
    共享层 — app/api，被 app/api/public.ts、app/api/auth.ts、feature adapter 引用。

  【主要导出 / 路由】
    createPublicApiClient、createAuthApiClient、PublicApiClientOptions、AuthApiClientOptions

  【依赖关系】
    - 依赖：app/lib/http/*、config/site.ts、runtimeConfig.public.apiBase
    - 被引用：app/api/public.ts、app/api/auth.ts、tests/unit/api-clients.test.ts

  【渲染 / 数据】
    baseURL 为 NUXT_PUBLIC_API_BASE（已含 /api/v1 前缀）；Public client 安全用于 SSR / prerender / SWR。

  【边界与注意】
    createProductApiClient 定义在 app/api/auth.ts，不在本文件。
    Public client 必须剥 authorization/cookie，防止 SSR 泄露 session。
*/
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

  // Public 请求不得携带 session token，避免 SSR/prerender 泄露
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
