/*
  【文件职责】
    单测：app/middleware/auth.ts 登录 redirect 与 RBAC 决策树纯函数。

  【架构位置】
    tests/unit — 无 Pinia / API mock。

  【主要导出 / 路由】
    describe auth middleware decisions

  【依赖关系】
    - 依赖：app/middleware/auth.ts
    - mock：无（hasRole/can 由测试注入 stub）

  【渲染 / 数据】
    无

  【边界与注意】
    不覆盖 ensureSession 与 navigateTo；不测 sign-in 页 resolveSafeRedirectPath。
*/
import { describe, expect, it } from 'vitest'
import {
  buildAuthLoginRedirect,
  isAuthorized,
  resolveAuthMiddlewareDecision
} from '../../app/middleware/auth'

describe('auth middleware decisions', () => {
  it('redirects unauthenticated users to sign-in with the original path', () => {
    expect(buildAuthLoginRedirect('/sign-in', '/account?tab=profile')).toEqual({
      path: '/sign-in',
      query: {
        redirect: '/account?tab=profile'
      }
    })

    expect(
      resolveAuthMiddlewareDecision(false, '/sign-in', '/account?tab=profile', undefined, {
        hasRole: () => false,
        can: () => false
      })
    ).toEqual({
      type: 'redirect',
      location: {
        path: '/sign-in',
        query: {
          redirect: '/account?tab=profile'
        }
      }
    })
  })

  it('allows authenticated users when no role or permission is required', () => {
    expect(
      isAuthorized(undefined, {
        hasRole: () => false,
        can: () => false
      })
    ).toBe(true)
  })

  it('checks role and permission requirements', () => {
    expect(
      isAuthorized(
        {
          roles: ['admin'],
          permissions: ['account:read']
        },
        {
          hasRole: (role) => role === 'admin',
          can: (permission) => permission === 'account:read'
        }
      )
    ).toBe(true)

    expect(
      isAuthorized(
        {
          roles: ['admin'],
          permissions: ['account:write']
        },
        {
          hasRole: (role) => role === 'admin',
          can: (permission) => permission === 'account:read'
        }
      )
    ).toBe(false)
  })

  it('returns a 403 decision for authenticated users without required permission', () => {
    expect(
      resolveAuthMiddlewareDecision(
        true,
        '/sign-in',
        '/account',
        {
          permissions: ['account:write']
        },
        {
          hasRole: () => false,
          can: (permission) => permission === 'account:read'
        }
      )
    ).toEqual({
      type: 'error',
      statusCode: 403,
      statusMessage: 'error.forbidden'
    })
  })
})
