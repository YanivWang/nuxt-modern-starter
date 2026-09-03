// @vitest-environment nuxt
/*
  【文件职责】
    单测：auth store 登录 / 注册 / logout / refresh 与 cookie 绑定行为。

  【架构位置】
    tests/unit — Pinia + vi.mock app/api/auth、attribution-params。
    令牌 cookie 走 useCookie/useNuxtApp，需 Nuxt 运行时，故首行 `// @vitest-environment nuxt` opt-in。

  【主要导出 / 路由】
    describe auth store（多 it 块）

  【依赖关系】
    - 依赖：app/stores/auth.ts、app/utils/auth-session.ts
    - mock：loginApi、logoutApi、fetchMeApi、refreshApi、registerApi、clearAttributionParams

  【渲染 / 数据】
    无

  【边界与注意】
    不覆盖 UI router.push；register 断言不自动 fetchMe；修改 store action 须同步。
    令牌断言一律读 useAuthSession()，store 不再持有令牌（见 tests/unit/ssr-cache-safety.test.ts）。
    readPersisted 的用例直接写 document.cookie：它存在的意义就是绕开 ref，
    用 ref 去断言等于没测到这一点。
*/
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore } from '../../app/stores/auth'
import { useAuth } from '../../app/composables/useAuth'
import { createApiError } from '../../app/lib/http/error'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { AUTH_COOKIE_KEYS } from '../../config/auth'
import {
  requiresSecureCookie,
  tokenCookieOptions,
  useAuthSession
} from '../../app/utils/auth-session'

const apiMocks = vi.hoisted(() => ({
  loginApi: vi.fn(),
  logoutApi: vi.fn(),
  fetchMeApi: vi.fn(),
  refreshApi: vi.fn(),
  registerApi: vi.fn()
}))

const attributionMocks = vi.hoisted(() => ({
  clearAttributionParams: vi.fn()
}))

vi.mock('../../app/utils/attribution-params', () => ({
  clearAttributionParams: attributionMocks.clearAttributionParams
}))

vi.mock('../../app/api/auth', () => ({
  ...apiMocks,
  normalizeAuthUser: (user: {
    id: string | number
    username: string
    avatar?: string | null
    nickname?: string | null
    roles?: string[]
    permissions?: string[]
  }) => ({
    id: user.id,
    username: user.username,
    avatar: user.avatar ?? null,
    nickname: user.nickname ?? null,
    roles: user.roles ?? [],
    permissions: user.permissions ?? []
  })
}))

/** 令牌唯一来源是会话模块；store 上没有令牌可读 */
const session = () => useAuthSession()

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    session().clear()
    vi.clearAllMocks()
  })

  it('writes tokens and hydrates user after login', async () => {
    apiMocks.loginApi.mockResolvedValue({
      code: 200,
      message: 'ok',
      data: {
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      }
    })
    apiMocks.fetchMeApi.mockResolvedValue({
      code: 200,
      message: 'ok',
      data: {
        user: {
          id: 1,
          username: 'alice',
          nickname: 'Alice'
        }
      }
    })

    const authStore = useAuthStore()
    await authStore.login({ username: 'alice', password: 'secret' })

    expect(session().accessToken.value).toBe('access-token')
    expect(session().refreshToken.value).toBe('refresh-token')
    expect(authStore.user?.username).toBe('alice')
    expect(authStore.isAuthenticated).toBe(true)
    expect(apiMocks.fetchMeApi).toHaveBeenCalledWith('access-token')
  })

  it('resets the loading state and partial session when login fails', async () => {
    apiMocks.loginApi.mockRejectedValue(
      createApiError({ statusCode: 401, message: 'Invalid credentials' })
    )

    const authStore = useAuthStore()

    await expect(authStore.login({ username: 'alice', password: 'secret' })).rejects.toMatchObject({
      statusCode: 401
    })
    expect(authStore.status).toBe('unauthenticated')
    expect(session().accessToken.value).toBeFalsy()
    expect(session().refreshToken.value).toBeFalsy()
    expect(authStore.user).toBeNull()
  })

  it('uses strict same-site cookies for token persistence', () => {
    expect(tokenCookieOptions(60)).toMatchObject({
      maxAge: 60,
      path: '/',
      sameSite: 'strict'
    })
  })

  it('reads the tokens the browser actually holds, not this app instance ref', () => {
    // 跨标签页判断「别的标签页是不是已经换过令牌了」必须看 document.cookie：
    // ref 只是本 app 实例的快照，另一个标签页写完要靠 BroadcastChannel 异步同步过来。
    // 见 app/api/auth.ts 的 withCrossTabRefreshLock。
    document.cookie = `${AUTH_COOKIE_KEYS.accessToken}=cookie-access; path=/`
    document.cookie = `${AUTH_COOKIE_KEYS.refreshToken}=${encodeURIComponent('cookie/refresh')}; path=/`

    expect(session().readPersisted()).toEqual({
      accessToken: 'cookie-access',
      refreshToken: 'cookie/refresh'
    })
  })

  it('reports a missing or empty token cookie as null', () => {
    document.cookie = `${AUTH_COOKIE_KEYS.accessToken}=; path=/; max-age=0`
    document.cookie = `${AUTH_COOKIE_KEYS.refreshToken}=; path=/; max-age=0`

    expect(session().readPersisted()).toEqual({ accessToken: null, refreshToken: null })
  })

  it('marks token cookies Secure whenever the site is served over https', () => {
    // 判据跟传输协议走，不跟环境标签走
    expect(requiresSecureCookie('development', 'http://localhost:3000')).toBe(false)
    expect(requiresSecureCookie('production', 'http://internal.example')).toBe(true)
    expect(requiresSecureCookie('test', 'https://test.example.com')).toBe(true)
    expect(requiresSecureCookie('staging', 'https://staging.example.com')).toBe(true)
  })

  it('marks token cookies Secure in every tracked https environment profile', () => {
    // 直接拿仓库里的环境层比对：.env.test 就是 APP_ENV=test + https 站点 URL 的组合，
    // 只按 appEnv 判断时它的令牌 cookie 不带 Secure，而这里读的是真实文件，不是复述规则。
    const readEnv = (envFile: string) => {
      const lines = readFileSync(resolve(import.meta.dirname, '../..', envFile), 'utf8').split('\n')
      const valueOf = (key: string) =>
        lines
          .find((line) => line.startsWith(`${key}=`))
          ?.slice(key.length + 1)
          .trim() ?? ''

      return { appEnv: valueOf('NUXT_PUBLIC_APP_ENV'), siteUrl: valueOf('NUXT_PUBLIC_SITE_URL') }
    }

    for (const envFile of ['.env.dev', '.env.test', '.env.prod', '.env.e2e']) {
      const { appEnv, siteUrl } = readEnv(envFile)

      expect(
        requiresSecureCookie(appEnv, siteUrl),
        `${envFile}（${appEnv} / ${siteUrl}）的令牌 cookie Secure 判定不符合传输协议`
      ).toBe(siteUrl.startsWith('https://') || appEnv === 'production')
    }
  })

  it('clears tokens and user on logout', async () => {
    apiMocks.logoutApi.mockResolvedValue({ code: 200, message: 'ok' })

    const authStore = useAuthStore()
    authStore.setTokens({
      code: 200,
      message: 'ok',
      data: {
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      }
    })
    authStore.user = {
      id: 1,
      username: 'alice',
      avatar: null,
      nickname: null,
      roles: [],
      permissions: []
    }

    await authStore.logout()

    expect(attributionMocks.clearAttributionParams).toHaveBeenCalledOnce()
    expect(session().accessToken.value).toBeFalsy()
    expect(session().refreshToken.value).toBeFalsy()
    expect(authStore.user).toBeNull()
    expect(authStore.status).toBe('unauthenticated')
  })

  it('preserves tokens when refresh fails for a temporary backend error', async () => {
    apiMocks.refreshApi.mockRejectedValue(
      createApiError({ statusCode: 503, message: 'Backend unavailable' })
    )

    const authStore = useAuthStore()
    authStore.setTokens({
      code: 200,
      message: 'ok',
      data: {
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      }
    })

    await expect(authStore.refresh()).rejects.toMatchObject({ statusCode: 503 })

    expect(attributionMocks.clearAttributionParams).not.toHaveBeenCalled()
    expect(authStore.status).toBe('idle')
    expect(session().accessToken.value).toBe('access-token')
    expect(session().refreshToken.value).toBe('refresh-token')
  })

  it('clears tokens when the refresh token is unauthorized', async () => {
    apiMocks.refreshApi.mockRejectedValue(
      createApiError({ statusCode: 401, message: 'Refresh token expired' })
    )

    const authStore = useAuthStore()
    authStore.setTokens({
      code: 200,
      message: 'ok',
      data: {
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      }
    })

    await expect(authStore.refresh()).rejects.toMatchObject({ statusCode: 401 })
    expect(authStore.status).toBe('unauthenticated')
    expect(session().accessToken.value).toBeFalsy()
    expect(session().refreshToken.value).toBeFalsy()
  })

  it('fills user from /api/v1/me', async () => {
    apiMocks.fetchMeApi.mockResolvedValue({
      code: 200,
      message: 'ok',
      data: {
        user: {
          id: 'u_1',
          username: 'bob',
          roles: ['admin'],
          permissions: ['account:read']
        }
      }
    })

    const authStore = useAuthStore()
    authStore.setTokens({
      code: 200,
      message: 'ok',
      data: {
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      }
    })

    await authStore.fetchMe()

    expect(authStore.user).toMatchObject({
      id: 'u_1',
      username: 'bob',
      roles: ['admin'],
      permissions: ['account:read']
    })
    expect(authStore.status).toBe('authenticated')
  })

  it('refreshes tokens with the refresh token cookie', async () => {
    apiMocks.refreshApi.mockResolvedValue({
      code: 200,
      message: 'ok',
      data: {
        accessToken: 'next-access-token',
        refreshToken: 'next-refresh-token'
      }
    })

    const authStore = useAuthStore()
    authStore.setTokens({
      code: 200,
      message: 'ok',
      data: {
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      }
    })

    await expect(authStore.refresh()).resolves.toBe(true)

    expect(apiMocks.refreshApi).toHaveBeenCalledWith('refresh-token')
    expect(session().accessToken.value).toBe('next-access-token')
    expect(session().refreshToken.value).toBe('next-refresh-token')
  })

  it('registers without mutating the local session', async () => {
    apiMocks.registerApi.mockResolvedValue({
      code: 200,
      message: 'created',
      data: null
    })

    const authStore = useAuthStore()

    await expect(authStore.register({ username: 'alice', password: 'secret' })).resolves.toEqual({
      code: 200,
      message: 'created',
      data: null
    })

    expect(session().accessToken.value).toBeFalsy()
    expect(session().refreshToken.value).toBeFalsy()
    expect(authStore.user).toBeNull()
  })

  it('marks the session unauthenticated when fetching user without access token', async () => {
    const authStore = useAuthStore()

    await expect(authStore.fetchMe()).rejects.toMatchObject({
      statusCode: 401
    })
    expect(authStore.status).toBe('unauthenticated')
    expect(apiMocks.fetchMeApi).not.toHaveBeenCalled()
  })

  it('does not refresh or clear the session when /me has a temporary backend error', async () => {
    apiMocks.fetchMeApi.mockRejectedValue(
      createApiError({ statusCode: 503, message: 'Backend unavailable' })
    )

    const authStore = useAuthStore()
    authStore.setTokens({
      code: 200,
      message: 'ok',
      data: {
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      }
    })

    await expect(useAuth().ensureSession()).rejects.toMatchObject({ statusCode: 503 })
    expect(apiMocks.refreshApi).not.toHaveBeenCalled()
    expect(session().accessToken.value).toBe('access-token')
    expect(session().refreshToken.value).toBe('refresh-token')
  })

  it('refreshes exactly once after /me returns an unauthorized error', async () => {
    apiMocks.fetchMeApi
      .mockRejectedValueOnce(createApiError({ statusCode: 401, message: 'Access token expired' }))
      .mockResolvedValueOnce({
        code: 200,
        message: 'ok',
        data: {
          user: {
            id: 1,
            username: 'alice'
          }
        }
      })
    apiMocks.refreshApi.mockResolvedValue({
      code: 200,
      message: 'ok',
      data: {
        accessToken: 'next-access-token',
        refreshToken: 'next-refresh-token'
      }
    })

    const authStore = useAuthStore()
    authStore.setTokens({
      code: 200,
      message: 'ok',
      data: {
        accessToken: 'expired-access-token',
        refreshToken: 'refresh-token'
      }
    })

    await expect(useAuth().ensureSession()).resolves.toBe(true)
    expect(apiMocks.refreshApi).toHaveBeenCalledOnce()
    expect(apiMocks.fetchMeApi).toHaveBeenCalledTimes(2)
    expect(apiMocks.fetchMeApi).toHaveBeenLastCalledWith('next-access-token')
    expect(authStore.status).toBe('authenticated')
  })
})
