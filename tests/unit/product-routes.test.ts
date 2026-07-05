import { describe, expect, it } from 'vitest'
import {
  csrRouteRules,
  productLocalizedPathPatterns,
  publicLocalizedPaths
} from '../../config/routes'

describe('product route boundaries', () => {
  it('generates localized CSR route patterns for the authenticated product area', () => {
    expect(productLocalizedPathPatterns()).toEqual(['/app/**', '/en/app/**'])
    expect(csrRouteRules).toEqual(['/app/**', '/en/app/**'])
  })

  it('keeps product routes out of the public SEO route list', () => {
    expect(publicLocalizedPaths()).not.toContain('/app')
    expect(publicLocalizedPaths()).not.toContain('/en/app')
  })
})
