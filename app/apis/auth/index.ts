import { AUTH_API_ENDPOINTS, type AuthUser, type Permission, type Role } from '../../../config/auth'
import { normalizeFlatApiResponse } from '../../api-core/api-error'
import { createBearerHeaders } from '../../api-core/api-headers'
import type { FlatApiResponse, NormalizedFlatApiResponse } from '../../api-core/api-types'
import {
  clearAuthSession,
  getRefreshTokenCookie,
  setAuthTokenCookies,
  tokenFromResponse
} from '../../utils/auth-session'

export type AuthEnvelope = NormalizedFlatApiResponse<FlatApiResponse>

export type RegisterPayload = {
  username: string
  password: string
}

export type LoginPayload = RegisterPayload

type BackendTokenResponse = FlatApiResponse & {
  token?: string
  accessToken?: string
  refreshToken: string
  accessTokenExpiresIn?: number
  refreshTokenExpiresIn?: number
}

export type TokenResponse = NormalizedFlatApiResponse<BackendTokenResponse>

export type BackendUser = {
  id: string | number
  username: string
  avatar?: string | null
  nickname?: string | null
  roles?: Role[]
  permissions?: Permission[]
}

type BackendMeResponse = FlatApiResponse & {
  user: BackendUser
}

export type MeResponse = NormalizedFlatApiResponse<BackendMeResponse>

type BackendProfileResponse = FlatApiResponse & {
  profile: Record<string, unknown> | null
}

export type ProfileResponse = NormalizedFlatApiResponse<BackendProfileResponse>

export type UpdateProfilePayload = Record<string, string | number | boolean | null | undefined>

const getApiBase = () => {
  const runtimeConfig = useRuntimeConfig()
  return runtimeConfig.public.apiBase
}

const isUnauthorizedError = (error: unknown) => {
  const fetchError = error as { response?: { status?: number }; statusCode?: number }
  return fetchError.response?.status === 401 || fetchError.statusCode === 401
}

let refreshPromise: Promise<string | null> | null = null

const refreshAccessToken = async () => {
  const refreshToken = getRefreshTokenCookie()

  if (!refreshToken.value) {
    clearAuthSession()
    return null
  }

  try {
    const response = await refreshApi(refreshToken.value)
    const nextAccessToken = tokenFromResponse(response)

    if (!nextAccessToken) {
      clearAuthSession()
      return null
    }

    setAuthTokenCookies(response)
    return nextAccessToken
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

const requestAuth = async <T extends FlatApiResponse>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PATCH'
    body?: unknown
    accessToken?: string | null
    retryOnUnauthorized?: boolean
  } = {}
) => {
  const send = (accessToken = options.accessToken) =>
    $fetch<T>(path, {
      baseURL: getApiBase(),
      method: options.method || 'GET',
      body: options.body as BodyInit | Record<string, unknown> | null | undefined,
      headers: createBearerHeaders(accessToken)
    })

  try {
    const response = await send()

    return normalizeFlatApiResponse(response)
  } catch (error) {
    if (!options.retryOnUnauthorized || !options.accessToken || !isUnauthorizedError(error)) {
      throw error
    }

    const nextAccessToken = await refreshAccessTokenOnce()

    if (!nextAccessToken) {
      throw error
    }

    const response = await send(nextAccessToken)

    return normalizeFlatApiResponse(response)
  }
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
  requestAuth<FlatApiResponse>(AUTH_API_ENDPOINTS.register, {
    method: 'POST',
    body: payload
  })

export const loginApi = (payload: LoginPayload) =>
  requestAuth<BackendTokenResponse>(AUTH_API_ENDPOINTS.login, {
    method: 'POST',
    body: payload
  })

export const refreshApi = (refreshToken: string) =>
  requestAuth<BackendTokenResponse>(AUTH_API_ENDPOINTS.refresh, {
    method: 'POST',
    body: { refreshToken }
  })

export const logoutApi = (accessToken: string | null, refreshToken: string | null) =>
  requestAuth<FlatApiResponse>(AUTH_API_ENDPOINTS.logout, {
    method: 'POST',
    accessToken,
    body: { refreshToken }
  })

export const fetchMeApi = (accessToken: string) =>
  requestAuth<BackendMeResponse>(AUTH_API_ENDPOINTS.me, {
    accessToken,
    retryOnUnauthorized: true
  })

export const fetchProfileApi = (accessToken: string) =>
  requestAuth<BackendProfileResponse>(AUTH_API_ENDPOINTS.profile, {
    accessToken,
    retryOnUnauthorized: true
  })

export const updateProfileApi = (accessToken: string, payload: UpdateProfilePayload) =>
  requestAuth<BackendProfileResponse>(AUTH_API_ENDPOINTS.profile, {
    method: 'PATCH',
    accessToken,
    body: payload,
    retryOnUnauthorized: true
  })
