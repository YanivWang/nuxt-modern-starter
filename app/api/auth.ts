/*
  【文件职责】
    鉴权 API adapter 与 Product client 定义：login / register / refresh / me / profile。
    refreshAccessTokenOnce 实现 401 单飞 refresh；createProductApiClient 供产品 adapter 使用。

  【架构位置】
    共享层 — app/api，被 auth store、共享产品 adapter、feature 私有 api adapter 消费。

  【主要导出 / 路由】
    createProductApiClient、refreshAccessTokenOnce、loginApi、registerApi、refreshApi、logoutApi、
    fetchMeApi、fetchProfileApi、updateProfileApi、normalizeAuthUser；
    并 re-export createAuthApiClient / AuthApiClientOptions

  【依赖关系】
    - 依赖：config/auth.ts、app/api/clients.ts、app/utils/auth-session.ts、app/utils/attribution-params.ts、
      app/types/user-profile.ts
    - 被引用：app/stores/auth.ts、app/api/workspace-project.ts、app/features/editor/api.ts

  【渲染 / 数据】
    adapter 相对路径：/login、/register、/refresh、/me 等（base 已含 /api/v1）。
    register 合并归因参数；Product client 默认从 cookie 读 accessToken。

  【边界与注意】
    createProductApiClient 定义在此文件，不在 app/api/clients.ts。
    refresh 仅在明确 401 时清除令牌；临时网络/服务端错误保留本地会话。
    并发 401 共享同一 refreshPromise，该 Promise 挂在 nuxtApp 上而非模块单例，
    避免 SSR 下跨请求共用同一次 refresh。
*/
import { AUTH_API_ENDPOINTS, type AuthUser, type Permission, type Role } from '../../config/auth'
import type { ApiResponse } from '../lib/http/types'
import type { UserProfile, WritableUserProfileFields } from '../types/user-profile'
import { createAuthApiClient, type AuthApiClientOptions } from './clients'
import { useAuthSession } from '../utils/auth-session'
import { mergeAttributionIntoBody } from '../utils/attribution-params'
import { isUnauthorizedError } from '../lib/http/error'

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
  /** 用户从未填写过资料时为 null；PATCH 之后必定非空 */
  profile: UserProfile | null
}

export type ProfileResponse = ApiResponse<ProfileData>

/**
 * 后端 PATCH body schema 是 strict 的：多一个键返回 400 而不是被忽略。
 * 因此这里必须收敛到可写字段，不能写成 Record<string, ...> 由调用方自由发挥。
 */
export type UpdateProfilePayload = Partial<WritableUserProfileFields>

export type ProductApiClientOptions = Omit<AuthApiClientOptions, 'refreshAccessToken'>

const REFRESH_PROMISE_KEY = '_authRefreshPromise'

type NuxtAppWithRefresh = ReturnType<typeof useNuxtApp> & {
  [REFRESH_PROMISE_KEY]?: Promise<string | null>
}

/** 无 Nuxt 上下文时（如纯工具单测）退化为模块级单飞 */
let fallbackRefreshPromise: Promise<string | null> | null = null

const refreshAccessToken = async () => {
  const session = useAuthSession()

  if (!session.refreshToken.value) {
    session.clear()
    return null
  }

  try {
    const response = await refreshApi(session.refreshToken.value)
    session.write(response.data)
    return response.data.accessToken
  } catch (error) {
    if (isUnauthorizedError(error)) {
      session.clear()
    }
    throw error
  }
}

export const refreshAccessTokenOnce = () => {
  // 401 单飞：并发请求共享同一 refresh Promise，避免 token 风暴。
  // Promise 按 Nuxt app 实例隔离，SSR 下不同请求不会共用同一次 refresh。
  const nuxtApp = tryUseNuxtApp() as NuxtAppWithRefresh | undefined

  if (!nuxtApp) {
    fallbackRefreshPromise ||= refreshAccessToken().finally(() => {
      fallbackRefreshPromise = null
    })

    return fallbackRefreshPromise
  }

  // 置 undefined 而非 delete：同样让下一次 401 重新发起 refresh，且不触发动态 key 删除
  nuxtApp[REFRESH_PROMISE_KEY] ||= refreshAccessToken().finally(() => {
    nuxtApp[REFRESH_PROMISE_KEY] = undefined
  })

  return nuxtApp[REFRESH_PROMISE_KEY]
}

export const createProductApiClient = (options: ProductApiClientOptions = {}) =>
  createAuthApiClient({
    ...options,
    accessToken: options.accessToken ?? useAuthSession().accessToken.value,
    refreshAccessToken: refreshAccessTokenOnce
  })

const sendAuthApiRequest = async <T>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PATCH'
    body?: unknown
    accessToken?: string | null
    /** true 时 401 走 refreshAccessTokenOnce 并重试一次（用于产品资料请求） */
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
    accessToken
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
