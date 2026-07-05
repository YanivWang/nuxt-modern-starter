import { describe, expect, it } from 'vitest'
import {
  csrRouteRules,
  localizedProductPathToCanonical,
  productPathPatterns,
  publicLocalizedPaths
} from '../../config/routes'

describe('product route boundaries', () => {
  it('keeps authenticated product routes language-neutral', () => {
    expect(productPathPatterns()).toEqual(['/app/**'])
    expect(csrRouteRules).toEqual(['/app/**'])
  })

  it('normalizes localized product paths to canonical product paths', () => {
    expect(localizedProductPathToCanonical('/en/app/workspace')).toBe('/app/workspace')
    expect(localizedProductPathToCanonical('/zh/app/workspace/deck-1/edit')).toBe(
      '/app/workspace/deck-1/edit'
    )
    expect(localizedProductPathToCanonical('/app/workspace')).toBeNull()
    expect(localizedProductPathToCanonical('/en/pricing')).toBeNull()
  })

  it('keeps product routes out of the public SEO route list', () => {
    expect(publicLocalizedPaths()).not.toContain('/app')
    expect(publicLocalizedPaths()).not.toContain('/en/app')
  })
})
