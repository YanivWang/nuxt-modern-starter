import { describe, expect, it } from 'vitest'
import {
  buildAuthLoginRedirect,
  isAuthorized,
  resolveAuthMiddlewareDecision
} from '../../app/middleware/auth'

describe('auth middleware decisions', () => {
  it('redirects unauthenticated users to login with the original path', () => {
    expect(buildAuthLoginRedirect('/login', '/app/account?tab=profile')).toEqual({
      path: '/login',
      query: {
        redirect: '/app/account?tab=profile'
      }
    })

    expect(
      resolveAuthMiddlewareDecision(false, '/login', '/app/account?tab=profile', undefined, {
        hasRole: () => false,
        can: () => false
      })
    ).toEqual({
      type: 'redirect',
      location: {
        path: '/login',
        query: {
          redirect: '/app/account?tab=profile'
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
        '/login',
        '/app/account',
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
