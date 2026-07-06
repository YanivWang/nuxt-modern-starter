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
