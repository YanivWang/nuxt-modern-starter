import { describe, expect, it } from 'vitest'
import {
  getProductRouteConfig,
  productNavItems,
  productRouteConfigs
} from '../../app/features/product-shell'

describe('product shell configuration', () => {
  it('centralizes product navigation entries', () => {
    expect(productNavItems.map((item) => item.path)).toEqual([
      '/app/workspace',
      '/app/editor',
      '/app/account'
    ])
  })

  it('marks every configured product route as authenticated and noindex', () => {
    expect(productRouteConfigs.length).toBeGreaterThanOrEqual(5)

    for (const route of productRouteConfigs) {
      expect(route.path.startsWith('/app/')).toBe(true)
      expect(route.auth.required).toBe(true)
      expect(route.seo.noindex).toBe(true)
    }
  })

  it('looks up concrete and dynamic product route configs', () => {
    expect(getProductRouteConfig('/app/workspace')?.labelKey).toBe('workspace.nav')
    expect(getProductRouteConfig('/app/workspace/openclaw-guide/edit')?.mode).toBe('edit')
    expect(getProductRouteConfig('/app/workspace/openclaw-guide/preview')?.mode).toBe('preview')
    expect(getProductRouteConfig('/pricing')).toBeNull()
  })
})
