export const AUTH_API_ENDPOINTS = {
  register: '/register',
  login: '/login',
  refresh: '/refresh',
  logout: '/logout',
  me: '/me',
  profile: '/me/profile'
} as const

export const AUTH_COOKIE_KEYS = {
  accessToken: 'nuxt-modern-starter-access-token',
  refreshToken: 'nuxt-modern-starter-refresh-token'
} as const

export const AUTH_REDIRECTS = {
  login: '/login',
  logout: '/'
} as const

export const ACCESS_TOKEN_MAX_AGE = 900
export const REFRESH_TOKEN_MAX_AGE = 2_592_000

export type Role = string

export type Permission = string

export type AuthUser = {
  id: string | number
  username: string
  avatar?: string | null
  nickname?: string | null
  roles: Role[]
  permissions: Permission[]
}

export type AuthRouteMeta = {
  roles?: Role[]
  permissions?: Permission[]
}
