/*
  【文件职责】
    鉴权会话模块：令牌的唯一所有者。持有 access / refresh token 的 cookie ref，
    提供读取、写入、清除，并保证「同一个 Nuxt app 实例内只有一份令牌来源」。

  【架构位置】
    共享层 — app/utils，被 app/api/auth.ts、app/stores/auth.ts、app/composables/useAuth.ts 单向依赖。
    本模块不认识 Pinia，也不 import 任何 store；依赖方向永远是 store/api → session。

  【主要导出 / 路由】
    useAuthSession、tokenCookieOptions、TokenResponseData

  【依赖关系】
    - 依赖：config/auth.ts（AUTH_COOKIE_KEYS、max-age）
    - 被引用：app/api/auth.ts、app/stores/auth.ts、app/composables/useAuth.ts、
      app/plugins/auth.client.ts、app/features/account/components/AccountPage.vue

  【渲染 / 数据】
    令牌只以 cookie 为载体，永远不进入 Pinia state —— setup store 返回的 ref 会被
    @pinia/nuxt 序列化进 nuxtApp.payload.pinia，即写进 SSR HTML。缓存路由（SWR / prerender）
    会把该 HTML 发给其他访客，因此令牌必须留在本模块，只以 computed / action 形式对外暴露。

  【边界与注意】
    cookie ref 缓存在 nuxtApp 上而非模块单例：模块单例会让 SSR 跨请求串会话。
    ref 在 detached effectScope 中创建，避免首个调用方组件卸载时被 onScopeDispose 回收。
    修改 max-age 需同步 config/auth.ts 与 tests/unit/auth-store.test.ts。
*/
import { effectScope, type Ref } from 'vue'
import { ACCESS_TOKEN_MAX_AGE, AUTH_COOKIE_KEYS, REFRESH_TOKEN_MAX_AGE } from '../../config/auth'

export type TokenResponseData = {
  accessToken: string
  refreshToken: string
}

export const tokenCookieOptions = (maxAge: number) => {
  const config = useRuntimeConfig()

  return {
    maxAge,
    sameSite: 'strict' as const,
    path: '/',
    // production 环境启用 secure，与 HTTPS 部署一致
    secure: config.public.appEnv === 'production'
  }
}

type AuthSessionRefs = {
  accessToken: Ref<string | null>
  refreshToken: Ref<string | null>
}

/** nuxtApp 上的私有缓存键；每个请求 / 每个客户端 app 各持一份 */
const AUTH_SESSION_REFS_KEY = '_authSessionRefs'

type NuxtAppWithSession = ReturnType<typeof useNuxtApp> & {
  [AUTH_SESSION_REFS_KEY]?: AuthSessionRefs
}

const createAuthSessionRefs = (): AuthSessionRefs => {
  // detached scope：cookie ref 与 app 同寿命，不随首个调用方组件卸载而失效
  const scope = effectScope(true)

  return scope.run(() => ({
    accessToken: useCookie<string | null>(
      AUTH_COOKIE_KEYS.accessToken,
      tokenCookieOptions(ACCESS_TOKEN_MAX_AGE)
    ),
    refreshToken: useCookie<string | null>(
      AUTH_COOKIE_KEYS.refreshToken,
      tokenCookieOptions(REFRESH_TOKEN_MAX_AGE)
    )
  })) as AuthSessionRefs
}

const useAuthSessionRefs = () => {
  const nuxtApp = useNuxtApp() as NuxtAppWithSession

  nuxtApp[AUTH_SESSION_REFS_KEY] ||= createAuthSessionRefs()

  return nuxtApp[AUTH_SESSION_REFS_KEY]
}

/**
 * 令牌访问入口。accessToken / refreshToken 是响应式 ref：
 * 任意一层调用 clear() 后，依赖它们的 computed（如 authStore.isAuthenticated）立即失效，
 * 无需 api 层反向通知 store。
 */
export const useAuthSession = () => {
  const { accessToken, refreshToken } = useAuthSessionRefs()

  const write = (tokens: TokenResponseData) => {
    accessToken.value = tokens.accessToken
    refreshToken.value = tokens.refreshToken
  }

  const clear = () => {
    accessToken.value = null
    refreshToken.value = null
  }

  return {
    accessToken,
    refreshToken,
    write,
    clear
  }
}
