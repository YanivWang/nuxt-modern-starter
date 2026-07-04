import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useAuthStore } from '../../app/stores/auth'

describe('auth permission helpers', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('checks roles from the normalized user', () => {
    const authStore = useAuthStore()
    authStore.user = {
      id: 1,
      username: 'alice',
      avatar: null,
      nickname: null,
      roles: ['admin'],
      permissions: []
    }

    expect(authStore.hasRole('admin')).toBe(true)
    expect(authStore.hasRole('member')).toBe(false)
  })

  it('checks permissions from the normalized user', () => {
    const authStore = useAuthStore()
    authStore.user = {
      id: 1,
      username: 'alice',
      avatar: null,
      nickname: null,
      roles: [],
      permissions: ['account:read']
    }

    expect(authStore.hasPermission('account:read')).toBe(true)
    expect(authStore.hasPermission('account:write')).toBe(false)
  })
})
