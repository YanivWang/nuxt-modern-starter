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
*/
import { beforeEach, describe, expect, it, vi } from 'vitest'

const sessionMocks = vi.hoisted(() => ({
  accessToken: { value: null as string | null },
  refreshToken: { value: null as string | null },
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
