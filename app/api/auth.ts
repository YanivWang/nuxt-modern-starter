import { AUTH_API_ENDPOINTS, type AuthUser, type Permission, type Role } from '../../config/auth'
import type { ApiResponse } from '../lib/http/types'
import { createAuthApiClient, type AuthApiClientOptions } from './clients'
import {
  clearAuthSession,
  getAccessTokenCookie,
  getRefreshTokenCookie,
  setAuthTokenCookies
} from '../utils/auth-session'
import { mergeAttributionIntoBody } from '../utils/attribution-params'

export { createAuthApiClient, type AuthApiClientOptions } from './clients'

export type AuthEnvelope = ApiResponse<null>

export type RegisterPayload = {
  username: string
  password: string
}

export type LoginPayload = RegisterPayload

export type TokenData = {
  accessToken: string
  refreshToken: string
  accessTokenExpiresIn?: number
  refreshTokenExpiresIn?: number
}

export type TokenResponse = ApiResponse<TokenData>

export type BackendUser = {
  id: string | number
  username: string
  avatar?: string | null
  nickname?: string | null
  roles?: Role[]
  permissions?: Permission[]
}

type MeData = {
  user: BackendUser
}

export type MeResponse = ApiResponse<MeData>

type ProfileData = {
  profile: Record<string, unknown> | null
}

export type ProfileResponse = ApiResponse<ProfileData>

export type UpdateProfilePayload = Record<string, string | number | boolean | null | undefined>

export type ProductApiClientOptions = Omit<AuthApiClientOptions, 'refreshAccessToken'>

let refreshPromise: Promise<string | null> | null = null

const refreshAccessToken = async () => {
  const refreshToken = getRefreshTokenCookie()

  if (!refreshToken.value) {
    clearAuthSession()
    return null
  }

  try {
    const response = await refreshApi(refreshToken.value)
    setAuthTokenCookies(response.data)
    return response.data.accessToken
  } catch (error) {
    clearAuthSession()
    throw error
  }
}

export const refreshAccessTokenOnce = () => {
  refreshPromise ||= refreshAccessToken().finally(() => {
    refreshPromise = null
  })

  return refreshPromise
}

export const createProductApiClient = (options: ProductApiClientOptions = {}) =>
  createAuthApiClient({
    ...options,
    accessToken: options.accessToken ?? getAccessTokenCookie().value,
    refreshAccessToken: refreshAccessTokenOnce
  })

const sendAuthApiRequest = async <T>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PATCH'
    body?: unknown
    accessToken?: string | null
    retryOnUnauthorized?: boolean
  } = {}
) => {
  const client = createAuthApiClient({
    accessToken: options.accessToken,
    refreshAccessToken: options.retryOnUnauthorized ? refreshAccessTokenOnce : undefined
  })

  return client.request<T>(path, {
    method: options.method || 'GET',
    body: options.body as BodyInit | Record<string, unknown> | null | undefined
  })
}

export const normalizeAuthUser = (user: BackendUser): AuthUser => ({
  id: user.id,
  username: user.username,
  avatar: user.avatar ?? null,
  nickname: user.nickname ?? null,
  roles: user.roles ?? [],
  permissions: user.permissions ?? []
})

export const registerApi = (payload: RegisterPayload) =>
  sendAuthApiRequest<AuthEnvelope>(AUTH_API_ENDPOINTS.register, {
    method: 'POST',
    body: mergeAttributionIntoBody(payload) as RegisterPayload & Record<string, string>
  })

export const loginApi = (payload: LoginPayload) =>
  sendAuthApiRequest<TokenResponse>(AUTH_API_ENDPOINTS.login, {
    method: 'POST',
    body: payload
  })

export const refreshApi = (refreshToken: string) =>
  sendAuthApiRequest<TokenResponse>(AUTH_API_ENDPOINTS.refresh, {
    method: 'POST',
    body: { refreshToken }
  })

export const logoutApi = (accessToken: string | null, refreshToken: string | null) =>
  sendAuthApiRequest<AuthEnvelope>(AUTH_API_ENDPOINTS.logout, {
    method: 'POST',
    accessToken,
    body: { refreshToken }
  })

export const fetchMeApi = (accessToken: string) =>
  sendAuthApiRequest<MeResponse>(AUTH_API_ENDPOINTS.me, {
    accessToken,
    retryOnUnauthorized: true
  })

export const fetchProfileApi = (accessToken: string) =>
  sendAuthApiRequest<ProfileResponse>(AUTH_API_ENDPOINTS.profile, {
    accessToken,
    retryOnUnauthorized: true
  })

export const updateProfileApi = (accessToken: string, payload: UpdateProfilePayload) =>
  sendAuthApiRequest<ProfileResponse>(AUTH_API_ENDPOINTS.profile, {
    method: 'PATCH',
    accessToken,
    body: payload,
    retryOnUnauthorized: true
  })
