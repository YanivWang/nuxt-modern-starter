/*
  【文件职责】
    单测：app/api/auth refreshAccessTokenOnce 单飞、register 归因合并。

  【架构位置】
    tests/unit — mock auth-session、clients、attribution。

  【主要导出 / 路由】
    describe auth api（refresh / register 等）

  【依赖关系】
    - 依赖：app/api/auth.ts
    - mock：useAuthSession、createAuthApiClient、mergeAttributionIntoBody

  【渲染 / 数据】
    无

  【边界与注意】
    不覆盖完整 login 页面流；并发 refresh 单飞行为必测。
    单飞 Promise 挂在 nuxtApp 上，跨 vi.resetModules() 仍共享同一次 refresh。

    happy-dom 没有 navigator.locks，因此这里跑的是 withCrossTabRefreshLock 的退化分支。
    锁本身（跨标签页互斥）不在单测覆盖范围内 —— 那需要两个真实的浏览器上下文；
    这里覆盖的是锁内那段判断：拿到锁之后是接着换，还是采用别人已经换好的。
*/
import { beforeEach, describe, expect, it, vi } from 'vitest'

const sessionMocks = vi.hoisted(() => ({
  accessToken: { value: null as string | null },
  refreshToken: { value: null as string | null },
  /** 浏览器 cookie 里当前那一对令牌；跨标签页用例通过它模拟「别的标签页已经换过了」 */
  persisted: { accessToken: null as string | null, refreshToken: null as string | null },
  readPersisted: vi.fn(() => sessionMocks.persisted),
  write: vi.fn(),
  clear: vi.fn()
}))

const clientMocks = vi.hoisted(() => ({
  request: vi.fn()
}))

const attributionMocks = vi.hoisted(() => ({
  mergeAttributionIntoBody: vi.fn((body: Record<string, unknown>) => ({
    ...body,
    utm_source: 'ads'
  }))
}))

vi.mock('../../app/utils/auth-session', () => ({
  useAuthSession: () => sessionMocks
}))
vi.mock('../../app/utils/attribution-params', () => attributionMocks)
vi.mock('../../app/api/clients', () => ({
  createAuthApiClient: vi.fn(() => ({
    request: clientMocks.request
  }))
}))

describe('auth api', () => {
  beforeEach(async () => {
    vi.resetModules()
    vi.clearAllMocks()
    sessionMocks.accessToken.value = 'access-token'
    sessionMocks.refreshToken.value = 'refresh-token'
    // 默认：cookie 里就是本标签页手上这一对，没有别的标签页动过
    sessionMocks.persisted = { accessToken: 'access-token', refreshToken: 'refresh-token' }
  })

  it('deduplicates concurrent refresh requests', async () => {
    let resolveRefresh: ((value: unknown) => void) | undefined
    clientMocks.request.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRefresh = resolve
        })
    )

    const { refreshAccessTokenOnce } = await import('../../app/api/auth')
    const first = refreshAccessTokenOnce()
    const second = refreshAccessTokenOnce()

    expect(clientMocks.request).toHaveBeenCalledTimes(1)

    resolveRefresh?.({
      code: 200,
      message: 'ok',
      data: {
        accessToken: 'next-access-token',
        refreshToken: 'next-refresh-token'
      }
    })

    await expect(first).resolves.toBe('next-access-token')
    await expect(second).resolves.toBe('next-access-token')
  })

  it('keeps the local session when refresh fails for a temporary backend error', async () => {
    const { createApiError } = await import('../../app/lib/http/error')
    clientMocks.request.mockRejectedValue(
      createApiError({ statusCode: 503, message: 'Backend unavailable' })
    )

    const { refreshAccessTokenOnce } = await import('../../app/api/auth')

    await expect(refreshAccessTokenOnce()).rejects.toMatchObject({ statusCode: 503 })
    expect(sessionMocks.clear).not.toHaveBeenCalled()
  })

  it('clears the local session when the refresh token is unauthorized', async () => {
    const { createApiError } = await import('../../app/lib/http/error')
    clientMocks.request.mockRejectedValue(
      createApiError({ statusCode: 401, message: 'Refresh token expired' })
    )

    const { refreshAccessTokenOnce } = await import('../../app/api/auth')

    await expect(refreshAccessTokenOnce()).rejects.toMatchObject({ statusCode: 401 })
    expect(sessionMocks.clear).toHaveBeenCalledOnce()
  })

  it('adopts the tokens another tab already rotated instead of replaying the old one', async () => {
    // 后端的 refresh token 是一次性的：拿已经被轮换掉的旧值再换一次会被判成重放，
    // 整条 token 家族被撤销 —— 两个标签页会一起被登出。
    sessionMocks.persisted = {
      accessToken: 'access-token-from-other-tab',
      refreshToken: 'refresh-token-from-other-tab'
    }

    const { refreshAccessTokenOnce } = await import('../../app/api/auth')

    await expect(refreshAccessTokenOnce()).resolves.toBe('access-token-from-other-tab')
    expect(clientMocks.request).not.toHaveBeenCalled()
    expect(sessionMocks.write).toHaveBeenCalledWith({
      accessToken: 'access-token-from-other-tab',
      refreshToken: 'refresh-token-from-other-tab'
    })
  })

  it('refreshes with the cookie value rather than the ref snapshot', async () => {
    // ref 是本 app 实例的快照，可能已经落后于浏览器里真正存着的那一份
    sessionMocks.persisted = { accessToken: null, refreshToken: 'refresh-token-from-cookie' }
    clientMocks.request.mockResolvedValue({
      code: 200,
      message: 'ok',
      data: { accessToken: 'next-access-token', refreshToken: 'next-refresh-token' }
    })

    const { refreshAccessTokenOnce } = await import('../../app/api/auth')
    await refreshAccessTokenOnce()

    expect(clientMocks.request).toHaveBeenCalledWith('/refresh', {
      method: 'POST',
      body: { refreshToken: 'refresh-token-from-cookie' }
    })
  })

  it('merges attribution params into register payloads', async () => {
    clientMocks.request.mockResolvedValue({
      code: 200,
      message: 'created',
      data: null
    })

    const { registerApi } = await import('../../app/api/auth')
    await registerApi({ username: 'alice', password: 'secret' })

    expect(attributionMocks.mergeAttributionIntoBody).toHaveBeenCalledWith({
      username: 'alice',
      password: 'secret'
    })
    expect(clientMocks.request).toHaveBeenCalledWith('/register', {
      method: 'POST',
      body: {
        username: 'alice',
        password: 'secret',
        utm_source: 'ads'
      }
    })
  })
})
