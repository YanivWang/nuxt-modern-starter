import { describe, expect, it } from 'vitest'
import { productFooterNavItems, productNavItems } from '../../app/features/product-shell'

describe('product shell configuration', () => {
  it('centralizes product navigation entries', () => {
    expect(productNavItems.map((item) => item.path)).toEqual(['/workspace', '/workspace/templates'])
    expect(productFooterNavItems.map((item) => item.path)).toEqual(['/pricing'])
  })

  it('uses productNav label keys for sidebar and footer items', () => {
    for (const item of [...productNavItems, ...productFooterNavItems]) {
      expect(item.labelKey.startsWith('productNav.')).toBe(true)
      expect(item.icon.length).toBeGreaterThan(0)
    }
  })
})
