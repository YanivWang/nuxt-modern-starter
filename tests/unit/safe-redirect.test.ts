import { describe, expect, it } from 'vitest'
import { isSafeRedirectPath, resolveSafeRedirectPath } from '../../app/utils/safe-redirect'

describe('safe redirect', () => {
  it('accepts same-origin relative paths', () => {
    expect(isSafeRedirectPath('/workspace')).toBe(true)
    expect(isSafeRedirectPath('/account?tab=profile')).toBe(true)
    expect(isSafeRedirectPath('/docs/project_1')).toBe(true)
  })

  it('rejects external and protocol-relative redirects', () => {
    expect(isSafeRedirectPath('https://evil.com')).toBe(false)
    expect(isSafeRedirectPath('//evil.com')).toBe(false)
    expect(isSafeRedirectPath('/\\evil.com')).toBe(false)
    expect(isSafeRedirectPath('/javascript:alert(1)')).toBe(false)
    expect(isSafeRedirectPath('workspace')).toBe(false)
  })

  it('falls back when redirect is missing or unsafe', () => {
    expect(resolveSafeRedirectPath(undefined, '/workspace')).toBe('/workspace')
    expect(resolveSafeRedirectPath('https://evil.com', '/workspace')).toBe('/workspace')
    expect(resolveSafeRedirectPath('/account', '/workspace')).toBe('/account')
  })
})
