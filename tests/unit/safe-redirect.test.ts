/*
  【文件职责】
    单测：resolveSafeRedirectPath 开放重定向防护规则。

  【架构位置】
    tests/unit — 纯函数。

  【主要导出 / 路由】
    describe safe redirect

  【依赖关系】
    - 依赖：app/utils/safe-redirect.ts
    - mock：无

  【渲染 / 数据】
    无

  【边界与注意】
    不覆盖 sign-in 页表单提交；仅 path 字符串校验。
*/
import { describe, expect, it } from 'vitest'
import { isSafeRedirectPath, resolveSafeRedirectPath } from '../../app/utils/safe-redirect'

describe('safe redirect', () => {
  it('accepts same-origin relative paths', () => {
    expect(isSafeRedirectPath('/workspace')).toBe(true)
    expect(isSafeRedirectPath('/account?tab=profile')).toBe(true)
    expect(isSafeRedirectPath('/docs/project_1')).toBe(true)
    expect(isSafeRedirectPath('/docs/1?ts=10:30')).toBe(true)
    expect(isSafeRedirectPath('/docs/1#slide=10:30')).toBe(true)
  })

  it('rejects external and protocol-relative redirects', () => {
    expect(isSafeRedirectPath('https://evil.com')).toBe(false)
    expect(isSafeRedirectPath('//evil.com')).toBe(false)
    expect(isSafeRedirectPath('/\\evil.com')).toBe(false)
    expect(isSafeRedirectPath('/%2F%2Fevil.com')).toBe(false)
    expect(isSafeRedirectPath('/javascript:alert(1)')).toBe(false)
    expect(isSafeRedirectPath('workspace')).toBe(false)
  })

  it('rejects whitespace and control characters before browser URL normalization', () => {
    expect(isSafeRedirectPath('/\t//evil.com')).toBe(false)
    expect(isSafeRedirectPath('/\n//evil.com')).toBe(false)
    expect(isSafeRedirectPath('/\r//evil.com')).toBe(false)
    expect(isSafeRedirectPath('/ //evil.com')).toBe(false)
    expect(isSafeRedirectPath('/docs/\u0000evil')).toBe(false)
  })

  it('falls back when redirect is missing or unsafe', () => {
    expect(resolveSafeRedirectPath(undefined, '/workspace')).toBe('/workspace')
    expect(resolveSafeRedirectPath('https://evil.com', '/workspace')).toBe('/workspace')
    expect(resolveSafeRedirectPath('/account', '/workspace')).toBe('/account')
  })
})
