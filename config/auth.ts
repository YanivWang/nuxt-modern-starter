/*
  【文件职责】
    鉴权模块常量与类型单一来源：API 相对路径、Cookie 键、redirect 目标、token 有效期、用户与路由 meta 类型。
    AUTH_API_ENDPOINTS 为 adapter 相对路径（不含 /api/v1 前缀，base 由 NUXT_PUBLIC_API_BASE 提供）。

  【架构位置】
    config 层 — 被 auth store、app/middleware/auth.ts、app/api/auth.ts 共享引用。

  【主要导出 / 路由】
    AUTH_API_ENDPOINTS、AUTH_COOKIE_KEYS、AUTH_REDIRECTS、ACCESS_TOKEN_MAX_AGE、
    REFRESH_TOKEN_MAX_AGE、REGISTER_USERNAME_MIN_LENGTH、REGISTER_USERNAME_MAX_LENGTH、
    REGISTER_PASSWORD_MIN_LENGTH、AuthUser、AuthRouteMeta、Role、Permission

  【依赖关系】
    - 依赖：无（纯常量与类型）
    - 被引用：app/stores/auth.ts、app/middleware/auth.ts、app/utils/auth-session.ts、app/api/auth.ts、
      app/pages/[[language]]/sign-up.vue

  【渲染 / 数据】
    无 — AUTH_REDIRECTS.login 指向 /sign-in；logout 默认 /（实际跳转由 UI 层 router.push 处理）。

  【边界与注意】
    createProductApiClient 定义在 app/api/auth.ts，不在 app/api/clients.ts。
    修改 token max-age 需同步 app/utils/auth-session.ts 与 tests/unit/auth-store.test.ts。
    REGISTER_* 是客户端校验的唯一来源，且必须与后端一致 —— 比服务端宽的客户端校验，
    只会把「输入不合法」推迟到一次失败的请求之后才告诉用户。
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

/**
 * 注册表单的长度约束，与后端 registerSchema 同源。
 *
 * 这些数字曾经只写在 sign-up.vue 的 a-form 规则里，而且比后端松（密码写的是 6，
 * 后端要求 8）—— 表单放行、请求发出去、再被服务端 400 打回来，用户看到的是一条
 * 事后才出现的错误。客户端校验的意义就是在发请求之前给出同一个答案，宽于服务端等于没有。
 *
 * 取值由 tests/unit/api-contract.test.ts 对着 contracts/openapi.yaml 里
 * /register 请求体的 minLength / maxLength 核对，后端调整策略时前端会直接变红。
 *
 * 不含密码上限：后端的 72 字节是 bcrypt 的限制，写在 Zod 的 refine 里，
 * OpenAPI 表达不了，因此这里也不复制一个没人对得上的数字，交给服务端报错。
 */
export const REGISTER_USERNAME_MIN_LENGTH = 2
export const REGISTER_USERNAME_MAX_LENGTH = 100
export const REGISTER_PASSWORD_MIN_LENGTH = 8

/** access token cookie max-age：900 秒 = 15 分钟 */
export const ACCESS_TOKEN_MAX_AGE = 900
/** refresh token cookie max-age：2_592_000 秒 = 30 天 */
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
