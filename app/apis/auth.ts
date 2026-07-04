import { AUTH_API_ENDPOINTS, type AuthUser, type Permission, type Role } from '../../config/auth'
import {
  normalizeFlatApiResponse,
  type FlatApiResponse,
  type NormalizedFlatApiResponse
} from '../utils/api-contract'

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
  return import.meta.server ? runtimeConfig.apiBase : runtimeConfig.public.apiBase
}

const createAuthHeaders = (accessToken?: string | null) => {
  const headers = new Headers()

  if (accessToken) {
    headers.set('authorization', `Bearer ${accessToken}`)
  }

  return headers
}

const requestAuth = async <T extends FlatApiResponse>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PATCH'
    body?: unknown
    accessToken?: string | null
  } = {}
) => {
  const response = await $fetch<T>(path, {
    baseURL: getApiBase(),
    method: options.method || 'GET',
    body: options.body as BodyInit | Record<string, unknown> | null | undefined,
    headers: createAuthHeaders(options.accessToken)
  })

  return normalizeFlatApiResponse(response)
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
    accessToken
  })

export const fetchProfileApi = (accessToken: string) =>
  requestAuth<BackendProfileResponse>(AUTH_API_ENDPOINTS.profile, {
    accessToken
  })

export const updateProfileApi = (accessToken: string, payload: UpdateProfilePayload) =>
  requestAuth<BackendProfileResponse>(AUTH_API_ENDPOINTS.profile, {
    method: 'PATCH',
    accessToken,
    body: payload
  })
