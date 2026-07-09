/*
  【文件职责】
    鉴权 session Cookie 读写：access / refresh token 持久化、清除与 auth store reset。
    tokenCookieOptions 按 appEnv 决定 secure 标志。

  【架构位置】
    共享层 — app/utils，被 app/api/auth.ts、app/stores/auth.ts 消费。

  【主要导出 / 路由】
    getAccessTokenCookie、getRefreshTokenCookie、setAuthTokenCookies、clearAuthSession、
    tokenCookieOptions、TokenResponseData

  【依赖关系】
    - 依赖：config/auth.ts（AUTH_COOKIE_KEYS、max-age）
    - 被引用：app/api/auth.ts、app/stores/auth.ts

  【渲染 / 数据】
    useCookie 在 SSR 与 CSR 均可用；clearAuthSession 在 Pinia 未激活时静默跳过 reset。

  【边界与注意】
    修改 max-age 需同步 config/auth.ts 与 tests/unit/auth-store.test.ts。
*/
import { ACCESS_TOKEN_MAX_AGE, AUTH_COOKIE_KEYS, REFRESH_TOKEN_MAX_AGE } from '../../config/auth'

export type TokenResponseData = {
  accessToken: string
  refreshToken: string
}

export const tokenCookieOptions = (maxAge: number) => {
  const config = useRuntimeConfig()

  return {
    maxAge,
    sameSite: 'strict' as const,
    path: '/',
    // production 环境启用 secure，与 HTTPS 部署一致
    secure: config.public.appEnv === 'production'
  }
}

export const getAccessTokenCookie = () =>
  useCookie<string | null>(AUTH_COOKIE_KEYS.accessToken, tokenCookieOptions(ACCESS_TOKEN_MAX_AGE))

export const getRefreshTokenCookie = () =>
  useCookie<string | null>(AUTH_COOKIE_KEYS.refreshToken, tokenCookieOptions(REFRESH_TOKEN_MAX_AGE))

export const setAuthTokenCookies = (response: TokenResponseData) => {
  getAccessTokenCookie().value = response.accessToken
  getRefreshTokenCookie().value = response.refreshToken
}

export const clearAuthSession = () => {
  getAccessTokenCookie().value = null
  getRefreshTokenCookie().value = null

  try {
    useAuthStore().reset()
  } catch {
    // Pinia may not be active in isolated utility tests.
  }
}
