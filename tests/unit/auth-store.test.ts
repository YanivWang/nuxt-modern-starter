import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AUTH_COOKIE_KEYS } from '../../config/auth'
import { useAuthStore } from '../../app/stores/auth'

const apiMocks = vi.hoisted(() => ({
  loginApi: vi.fn(),
  logoutApi: vi.fn(),
  fetchMeApi: vi.fn(),
  refreshApi: vi.fn(),
  registerApi: vi.fn()
}))

vi.mock('../../app/apis/auth', () => ({
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
  useCookie<string | null>(AUTH_COOKIE_KEYS.accessToken).value = null
  useCookie<string | null>(AUTH_COOKIE_KEYS.refreshToken).value = null
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
      msg: 'ok',
      accessToken: 'access-token',
      refreshToken: 'refresh-token'
    })
    apiMocks.fetchMeApi.mockResolvedValue({
      code: 200,
      msg: 'ok',
      user: {
        id: 1,
        username: 'alice',
        nickname: 'Alice'
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
    apiMocks.logoutApi.mockResolvedValue({ code: 200, msg: 'ok' })

    const authStore = useAuthStore()
    authStore.setTokens({
      code: 200,
      msg: 'ok',
      accessToken: 'access-token',
      refreshToken: 'refresh-token'
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

    expect(authStore.accessToken).toBeNull()
    expect(authStore.refreshToken).toBeNull()
    expect(authStore.user).toBeNull()
    expect(authStore.status).toBe('unauthenticated')
  })

  it('fills user from /api/me', async () => {
    apiMocks.fetchMeApi.mockResolvedValue({
      code: 200,
      msg: 'ok',
      user: {
        id: 'u_1',
        username: 'bob',
        roles: ['admin'],
        permissions: ['account:read']
      }
    })

    const authStore = useAuthStore()
    authStore.setTokens({
      code: 200,
      msg: 'ok',
      token: 'access-token',
      refreshToken: 'refresh-token'
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
})
