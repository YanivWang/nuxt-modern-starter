/*
  【文件职责】
    单测：authStore hasRole / hasPermission helper（归一化 user 字段）。

  【架构位置】
    tests/unit — Pinia，无 API mock。

  【主要导出 / 路由】
    describe auth permission helpers

  【依赖关系】
    - 依赖：app/stores/auth.ts
    - mock：无（直接赋值 user）

  【渲染 / 数据】
    无

  【边界与注意】
    不覆盖 app/middleware/auth.ts isAuthorized 组合逻辑。
*/
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
