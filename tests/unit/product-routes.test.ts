/*
  【文件职责】
    单测：产品路由 CSR 规则、localizedProductPathToCanonical、公开 SEO 列表隔离。

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
