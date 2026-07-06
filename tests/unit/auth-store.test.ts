import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore } from '../../app/stores/auth'
import { getAccessTokenCookie, getRefreshTokenCookie } from '../../app/utils/auth-session'

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

const clearAuthCookies = () => {
  getAccessTokenCookie().value = null
  getRefreshTokenCookie().value = null
}

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    clearAuthCookies()
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

    expect(authStore.accessToken).toBe('access-token')
    expect(authStore.refreshToken).toBe('refresh-token')
    expect(authStore.user?.username).toBe('alice')
    expect(authStore.isAuthenticated).toBe(true)
    expect(apiMocks.fetchMeApi).toHaveBeenCalledWith('access-token')
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
    expect(authStore.accessToken).toBeFalsy()
    expect(authStore.refreshToken).toBeFalsy()
    expect(authStore.user).toBeNull()
    expect(authStore.status).toBe('unauthenticated')
  })

  it('does not clear attribution when refresh fails and reset runs', async () => {
    apiMocks.refreshApi.mockRejectedValue(new Error('refresh failed'))

    const authStore = useAuthStore()
    authStore.setTokens({
      code: 200,
      message: 'ok',
      data: {
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      }
    })

    await expect(authStore.refresh()).rejects.toThrow('refresh failed')

    expect(attributionMocks.clearAttributionParams).not.toHaveBeenCalled()
    expect(authStore.status).toBe('unauthenticated')
  })

  it('fills user from /api/me', async () => {
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
        token: 'access-token',
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
    expect(authStore.accessToken).toBe('next-access-token')
    expect(authStore.refreshToken).toBe('next-refresh-token')
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

    expect(authStore.accessToken).toBeFalsy()
    expect(authStore.refreshToken).toBeFalsy()
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
})
