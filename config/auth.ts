/*
  【文件职责】
    鉴权模块常量与类型单一来源：API 相对路径、Cookie 键、redirect 目标、token 有效期、用户与路由 meta 类型。
    AUTH_API_ENDPOINTS 为 adapter 相对路径（不含重复 /api，base 由 NUXT_PUBLIC_API_BASE 提供）。

  【架构位置】
    config 层 — 被 auth store、app/middleware/auth.ts、app/api/auth.ts 共享引用。

  【主要导出 / 路由】
    AUTH_API_ENDPOINTS、AUTH_COOKIE_KEYS、AUTH_REDIRECTS、ACCESS_TOKEN_MAX_AGE、
    REFRESH_TOKEN_MAX_AGE、AuthUser、AuthRouteMeta、Role、Permission

  【依赖关系】
    - 依赖：无（纯常量与类型）
    - 被引用：app/stores/auth.ts、app/middleware/auth.ts、app/utils/auth-session.ts、app/api/auth.ts

  【渲染 / 数据】
    无 — AUTH_REDIRECTS.login 指向 /sign-in；logout 默认 /（实际跳转由 UI 层 router.push 处理）。

  【边界与注意】
    createProductApiClient 定义在 app/api/auth.ts，不在 app/api/clients.ts。
    修改 token max-age 需同步 app/utils/auth-session.ts 与 tests/unit/auth-store.test.ts。
*/
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
  login: '/sign-in',
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
