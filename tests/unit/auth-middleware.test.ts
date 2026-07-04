import { describe, expect, it } from 'vitest'
import { buildAuthLoginRedirect, isAuthorized } from '../../app/middleware/auth'

describe('auth middleware decisions', () => {
  it('redirects unauthenticated users to login with the original path', () => {
    expect(buildAuthLoginRedirect('/login', '/account?tab=profile')).toEqual({
      path: '/login',
      query: {
        redirect: '/account?tab=profile'
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
})
