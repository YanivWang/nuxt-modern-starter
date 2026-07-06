import { describe, expect, it } from 'vitest'
import {
  buildAuthLoginRedirect,
  buildProductCanonicalRedirect,
  isAuthorized,
  resolveAuthMiddlewareDecision
} from '../../app/middleware/auth'

describe('auth middleware decisions', () => {
  it('normalizes localized product paths through the shared canonical helper', () => {
    expect(buildProductCanonicalRedirect('/en/workspace')).toEqual({
      type: 'redirect',
      path: '/workspace',
      redirectCode: 301
    })
    expect(buildProductCanonicalRedirect('/workspace')).toBeNull()
    expect(buildProductCanonicalRedirect('/en/pricing')).toBeNull()
  })

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
