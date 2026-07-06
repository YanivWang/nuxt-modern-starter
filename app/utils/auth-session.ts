import { ACCESS_TOKEN_MAX_AGE, AUTH_COOKIE_KEYS, REFRESH_TOKEN_MAX_AGE } from '../../config/auth'

export type TokenResponseData = {
  accessToken: string
  refreshToken: string
}

export const tokenCookieOptions = (maxAge: number) => {
  const config = useRuntimeConfig()

  return {
    maxAge,
    sameSite: 'lax' as const,
    path: '/',
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
