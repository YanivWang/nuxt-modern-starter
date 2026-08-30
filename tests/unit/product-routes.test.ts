/*
  【文件职责】
    单测：产品路由 CSR 规则、localizedProductPathToCanonical、canonicalRequestPath、公开 SEO 列表隔离。

  【架构位置】
    tests/unit — config/routes.ts。

  【主要导出 / 路由】
    describe product route boundaries

  【依赖关系】
    - 依赖：config/routes.ts
    - mock：无

  【渲染 / 数据】
    无

  【边界与注意】
    不覆盖 nuxt.config routeRules 集成；修改 csrRouteRules 须同步。
*/
import { describe, expect, it } from 'vitest'
import {
  canonicalRequestPath,
  csrRouteRules,
  localizedProductPathToCanonical,
  productRoutePatterns,
  publicLocalizedPaths
} from '../../config/routes'

describe('product route boundaries', () => {
  it('keeps authenticated product routes language-neutral', () => {
    expect(productRoutePatterns).toEqual(['/workspace/**', '/docs/**', '/account'])
    expect(csrRouteRules).toEqual(['/workspace/**', '/docs/**', '/account'])
  })

  it('normalizes localized product paths to canonical product paths', () => {
    expect(localizedProductPathToCanonical('/en/workspace')).toBe('/workspace')
    expect(localizedProductPathToCanonical('/en/workspace/templates')).toBe('/workspace/templates')
    expect(localizedProductPathToCanonical('/en/docs/deck-1')).toBe('/docs/deck-1')
    expect(localizedProductPathToCanonical('/en/account')).toBe('/account')
    expect(localizedProductPathToCanonical('/workspace')).toBeNull()
    expect(localizedProductPathToCanonical('/en/pricing')).toBeNull()
  })

  it('keeps product routes out of the public SEO route list', () => {
    expect(publicLocalizedPaths()).not.toContain('/workspace')
    expect(publicLocalizedPaths()).not.toContain('/en/workspace')
  })
})

describe('canonicalRequestPath', () => {
  it('returns null for paths that are already canonical', () => {
    expect(canonicalRequestPath('/')).toBeNull()
    expect(canonicalRequestPath('/about')).toBeNull()
    expect(canonicalRequestPath('/en/pricing')).toBeNull()
    expect(canonicalRequestPath('/workspace')).toBeNull()
  })

  it('strips a trailing slash', () => {
    expect(canonicalRequestPath('/about/')).toBe('/about')
    expect(canonicalRequestPath('/en/news/')).toBe('/en/news')
    expect(canonicalRequestPath('/news/starter-release/')).toBe('/news/starter-release')
  })

  it('strips the default locale prefix', () => {
    expect(canonicalRequestPath('/zh')).toBe('/')
    expect(canonicalRequestPath('/zh/pricing')).toBe('/pricing')
  })

  it('makes localized product URLs language-neutral', () => {
    expect(canonicalRequestPath('/en/workspace')).toBe('/workspace')
    expect(canonicalRequestPath('/kr/docs/deck-1')).toBe('/docs/deck-1')
    expect(canonicalRequestPath('/zh-hk/account')).toBe('/account')
  })

  it('collapses stacked violations into a single redirect', () => {
    // 一次到位，避免 /en/workspace/ 连跳两次 301
    expect(canonicalRequestPath('/en/workspace/')).toBe('/workspace')
    expect(canonicalRequestPath('/zh/pricing/')).toBe('/pricing')
  })

  it('leaves non-default locale prefixes on public pages intact', () => {
    // /en/pricing 的语言前缀是 canonical 的一部分，不能被剥掉
    expect(canonicalRequestPath('/en/about')).toBeNull()
    expect(canonicalRequestPath('/kr/news')).toBeNull()
  })
})
