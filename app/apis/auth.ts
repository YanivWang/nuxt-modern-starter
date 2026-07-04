import {
  AUTH_API_ENDPOINTS,
  type AuthUser,
  type Permission,
  type Role
} from '../../config/auth'

export type AuthEnvelope = {
  code: number
  msg: string
}

export type RegisterPayload = {
  username: string
  password: string
}

export type LoginPayload = RegisterPayload

export type TokenResponse = AuthEnvelope & {
  token?: string
  accessToken?: string
  refreshToken: string
  accessTokenExpiresIn?: number
  refreshTokenExpiresIn?: number
}

export type BackendUser = {
  id: string | number
  username: string
  avatar?: string | null
  nickname?: string | null
  roles?: Role[]
  permissions?: Permission[]
}

export type MeResponse = AuthEnvelope & {
  user: BackendUser
}

export type ProfileResponse = AuthEnvelope & {
  profile: Record<string, unknown> | null
}

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

const requestAuth = <T>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PATCH'
    body?: unknown
    accessToken?: string | null
  } = {}
) =>
  $fetch<T>(path, {
    baseURL: getApiBase(),
    method: options.method || 'GET',
    body: options.body as BodyInit | Record<string, unknown> | null | undefined,
    headers: createAuthHeaders(options.accessToken)
  })

export const normalizeAuthUser = (user: BackendUser): AuthUser => ({
  id: user.id,
  username: user.username,
  avatar: user.avatar ?? null,
  nickname: user.nickname ?? null,
  roles: user.roles ?? [],
  permissions: user.permissions ?? []
})

export const registerApi = (payload: RegisterPayload) =>
  requestAuth<AuthEnvelope>(AUTH_API_ENDPOINTS.register, {
    method: 'POST',
    body: payload
  })

export const loginApi = (payload: LoginPayload) =>
  requestAuth<TokenResponse>(AUTH_API_ENDPOINTS.login, {
    method: 'POST',
    body: payload
  })

export const refreshApi = (refreshToken: string) =>
  requestAuth<TokenResponse>(AUTH_API_ENDPOINTS.refresh, {
    method: 'POST',
    body: { refreshToken }
  })

export const logoutApi = (accessToken: string | null, refreshToken: string | null) =>
  requestAuth<AuthEnvelope>(AUTH_API_ENDPOINTS.logout, {
    method: 'POST',
    accessToken,
    body: { refreshToken }
  })

export const fetchMeApi = (accessToken: string) =>
  requestAuth<MeResponse>(AUTH_API_ENDPOINTS.me, {
    accessToken
  })

export const fetchProfileApi = (accessToken: string) =>
  requestAuth<ProfileResponse>(AUTH_API_ENDPOINTS.profile, {
    accessToken
  })

export const updateProfileApi = (accessToken: string, payload: UpdateProfilePayload) =>
  requestAuth<ProfileResponse>(AUTH_API_ENDPOINTS.profile, {
    method: 'PATCH',
    accessToken,
    body: payload
  })
