import { ACCESS_TOKEN_MAX_AGE, AUTH_COOKIE_KEYS, REFRESH_TOKEN_MAX_AGE } from '../../config/auth'

export type TokenLikeResponse = {
  token?: string
  accessToken?: string
  refreshToken: string
}

export const tokenFromResponse = (response: TokenLikeResponse) =>
  response.accessToken || response.token || null

export const tokenCookieOptions = (maxAge: number) => {
  const config = useRuntimeConfig()

  return {
    maxAge,
    sameSite: 'lax' as const,
    path: '/',
    secure: config.appEnv === 'production'
  }
}

export const getAccessTokenCookie = () =>
  useCookie<string | null>(AUTH_COOKIE_KEYS.accessToken, tokenCookieOptions(ACCESS_TOKEN_MAX_AGE))

export const getRefreshTokenCookie = () =>
  useCookie<string | null>(AUTH_COOKIE_KEYS.refreshToken, tokenCookieOptions(REFRESH_TOKEN_MAX_AGE))

export const getAuthToken = () => getAccessTokenCookie().value

export const setAuthTokenCookies = (response: TokenLikeResponse) => {
  const nextAccessToken = tokenFromResponse(response)

  if (nextAccessToken) {
    getAccessTokenCookie().value = nextAccessToken
  }

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
