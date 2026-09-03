/*
  【文件职责】
    鉴权会话模块：令牌的唯一所有者。持有 access / refresh token 的 cookie ref，
    提供读取、写入、清除，并保证「同一个 Nuxt app 实例内只有一份令牌来源」。

  【架构位置】
    共享层 — app/utils，被 app/api/auth.ts、app/stores/auth.ts、app/composables/useAuth.ts 单向依赖。
    本模块不认识 Pinia，也不 import 任何 store；依赖方向永远是 store/api → session。

  【主要导出 / 路由】
    useAuthSession（accessToken / refreshToken / readPersisted / write / clear）、
    tokenCookieOptions、requiresSecureCookie、TokenResponseData

  【依赖关系】
    - 依赖：config/auth.ts（AUTH_COOKIE_KEYS、max-age）、
      runtimeConfig.public.appEnv / siteUrl（决定 cookie Secure）
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
    Secure 的判据见 requiresSecureCookie —— 跟传输协议走，不跟环境标签走。
    readPersisted 读的是 document.cookie 而不是 ref：跨标签页比对令牌时，
    ref 可能还停在本标签页的旧快照上，见该函数注释。
*/
import { effectScope, type Ref } from 'vue'
import { ACCESS_TOKEN_MAX_AGE, AUTH_COOKIE_KEYS, REFRESH_TOKEN_MAX_AGE } from '../../config/auth'

export type TokenResponseData = {
  accessToken: string
  refreshToken: string
}

/**
 * 直接从 document.cookie 读一个令牌，绕开本模块的 ref。
 *
 * ref 是「本 app 实例」的快照：另一个标签页写完 cookie 后，本标签页要等
 * Nuxt 的 BroadcastChannel 把新值异步同步过来才会更新。跨标签页判断
 * 「别人是不是已经换过令牌了」必须在某个确定的时刻拿到确定的值，
 * 等不起那一次异步同步，所以这里直接读浏览器里的那一份。
 */
const readPersistedToken = (name: string): string | null => {
  if (typeof document === 'undefined') {
    return null
  }

  const prefix = `${name}=`

  for (const entry of document.cookie.split(';')) {
    const trimmed = entry.trim()

    if (!trimmed.startsWith(prefix)) {
      continue
    }

    const raw = trimmed.slice(prefix.length)

    if (!raw) {
      return null
    }

    // useCookie 写入时按 encodeURIComponent 编码；JWT / base64url 不含需要转义的字符，
    // 但解一次才是与写入侧对称的做法。
    try {
      return decodeURIComponent(raw)
    } catch {
      return raw
    }
  }

  return null
}

/**
 * cookie 是否必须带 Secure。
 *
 * 判据是**实际传输协议**，不是环境标签。只看 appEnv === 'production' 的话，
 * 任何跑在 HTTPS 上但标签不叫 production 的环境（预发、灰度，包括仓库里
 * .env.test 这份 APP_ENV=test + SITE_URL=https://... 的组合）都会把令牌
 * 写成不带 Secure 的 cookie —— 一次降级到 http 的请求就能把它明文发出去。
 *
 * 两条判据是「或」的关系：保留 appEnv 那一支，是为了兼容 siteUrl 还没配成
 * 真实 https 域名的生产部署。因此本次改动只会让 Secure 出现得更多，不会更少。
 */
export const requiresSecureCookie = (appEnv: string, siteUrl: string) =>
  appEnv === 'production' || siteUrl.startsWith('https://')

export const tokenCookieOptions = (maxAge: number) => {
  const config = useRuntimeConfig()

  return {
    maxAge,
    sameSite: 'strict' as const,
    path: '/',
    secure: requiresSecureCookie(config.public.appEnv, config.public.siteUrl)
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

  /** 浏览器里当前真正存着的那一对令牌；SSR / 无 document 时为 null */
  const readPersisted = () => ({
    accessToken: readPersistedToken(AUTH_COOKIE_KEYS.accessToken),
    refreshToken: readPersistedToken(AUTH_COOKIE_KEYS.refreshToken)
  })

  return {
    accessToken,
    refreshToken,
    readPersisted,
    write,
    clear
  }
}
