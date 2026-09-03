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
    - 依赖：config/auth.ts、app/api/clients.ts、app/utils/auth-session.ts、app/types/user-profile.ts
    - 被引用：app/stores/auth.ts、app/api/workspace-project.ts、app/features/editor/api.ts

  【渲染 / 数据】
    adapter 相对路径：/login、/register、/refresh、/me 等（base 已含 /api/v1）。
    register 只发契约字段（不再夹带归因参数）；Product client 默认从 cookie 读 accessToken。

  【边界与注意】
    createProductApiClient 定义在此文件，不在 app/api/clients.ts。
    refresh 仅在明确 401 时清除令牌；临时网络/服务端错误保留本地会话。
    并发 401 共享同一 refreshPromise，该 Promise 挂在 nuxtApp 上而非模块单例，
    避免 SSR 下跨请求共用同一次 refresh。

    app 内单飞只解决了一半：refresh token 在后端是一次性的，轮换后旧值再用一次
    会被判成重放并撤销整条 token 家族，而多个标签页共用同一份 cookie。
    因此 refresh 还要经 Web Locks 在**浏览器级别**串行，见 withCrossTabRefreshLock。
*/
import { AUTH_API_ENDPOINTS, type AuthUser, type Permission, type Role } from '../../config/auth'
import type { ApiResponse } from '../lib/http/types'
import type { UserProfile, WritableUserProfileFields } from '../types/user-profile'
import { createAuthApiClient, type AuthApiClientOptions } from './clients'
import { useAuthSession } from '../utils/auth-session'
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

/** 同一浏览器内所有标签页共用的锁名 */
const REFRESH_LOCK_NAME = 'nuxt-modern-starter:auth-refresh'

/** 等锁上限：某个标签页的 refresh 卡住时，不能让其他标签页跟着一起挂死 */
const REFRESH_LOCK_WAIT_MS = 10_000

/**
 * 跨标签页串行执行一次 refresh。
 *
 * 后端的 refresh token 是一次性的：轮换之后旧值再被使用一次会判定为重放，
 * 于是**整条 token 家族**被撤销（OAuth 2.0 Security BCP 的标准做法）。
 * 而同一个浏览器的多个标签页共用同一份 cookie —— 两个标签页同时遇到 401 时，
 * 各自的 app 内单飞谁也拦不住对方，两边拿着同一个 refresh token 各发一次请求：
 * 先到的那次正常轮换，后到的那次被判成重放，两个标签页一起被登出。
 * 所以互斥必须做在浏览器级别，而不是 app 实例级别。
 *
 * Web Locks 不可用（SSR、老浏览器）或等待超时时退化为直接执行：
 * 此时仍有 app 内单飞，且锁内那次「别人是不是已经换过了」的检查同样会跑。
 */
const withCrossTabRefreshLock = async <T>(run: () => Promise<T>): Promise<T> => {
  const locks = globalThis.navigator?.locks

  if (!locks) {
    return run()
  }

  try {
    return await locks.request(
      REFRESH_LOCK_NAME,
      { signal: AbortSignal.timeout(REFRESH_LOCK_WAIT_MS) },
      run
    )
  } catch (error) {
    // 只有「等锁超时」才退化执行；run 自己抛的错必须原样向上抛。
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      return run()
    }

    throw error
  }
}

type AuthSession = ReturnType<typeof useAuthSession>

/**
 * 锁内的实际动作：先确认这次要用的 refresh token 还是不是浏览器里当前那一份。
 * 等锁期间别的标签页可能已经轮换过一轮，此时旧值已经作废，
 * 再拿它去换就是在自己触发重放检测 —— 直接采用对方换回来的那一对即可。
 */
const rotateOrAdoptTokens = async (session: AuthSession, attemptedRefreshToken: string) => {
  const persisted = session.readPersisted()

  if (
    persisted.refreshToken &&
    persisted.refreshToken !== attemptedRefreshToken &&
    persisted.accessToken
  ) {
    session.write({
      accessToken: persisted.accessToken,
      refreshToken: persisted.refreshToken
    })

    return persisted.accessToken
  }

  // 浏览器里那一份优先：它比进锁前读到的值更新
  const refreshToken = persisted.refreshToken || attemptedRefreshToken

  try {
    const response = await refreshApi(refreshToken)
    session.write(response.data)
    return response.data.accessToken
  } catch (error) {
    if (isUnauthorizedError(error)) {
      session.clear()
    }
    throw error
  }
}

const refreshAccessToken = async (): Promise<string | null> => {
  const session = useAuthSession()

  if (!session.refreshToken.value) {
    session.clear()
    return null
  }

  const attemptedRefreshToken = session.refreshToken.value
  // 锁的回调在 await 之后才执行，Nuxt 上下文已经丢了；
  // createAuthApiClient 要读 runtimeConfig，因此把上下文显式带进去。
  const nuxtApp = tryUseNuxtApp()
  const run = () => rotateOrAdoptTokens(session, attemptedRefreshToken)

  return withCrossTabRefreshLock(() => (nuxtApp ? nuxtApp.runWithContext(run) : run()))
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

/**
 * 注册只发契约声明过的字段。
 *
 * 这里曾把 localStorage 里的 utm_* / gclid 等归因参数浅合并进 body。那些键既不在
 * OpenAPI 的 /register 请求体里，后端的 Zod 也不是 strict 的 —— 它们被静默丢弃，
 * 整条链路从头到尾没有任何一端消费过。
 *
 * 删掉不是为了省事：本仓库所有契约机制都在防「接口说一套做一套」，
 * 而往请求里塞一份合同外的载荷正是那件事本身。真要做归因，应当是带契约、
 * 带存储、独立于鉴权领域的功能，而不是搭在注册接口上的暗管。
 * 采集本身保留（见 app/utils/attribution-params.ts），它对客户端分析仍然有用。
 */
export const registerApi = (payload: RegisterPayload) =>
  sendAuthApiRequest<AuthEnvelope>(AUTH_API_ENDPOINTS.register, {
    method: 'POST',
    body: payload
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
