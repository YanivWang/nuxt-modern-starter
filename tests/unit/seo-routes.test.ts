import { describe, expect, it } from 'vitest'
import { PUBLIC_PAGE_PATHS, SUPPORTED_LOCALES } from '../../config/site'
import { publicLocalizedPaths } from '../../config/routes'

describe('public SEO routes', () => {
  it('generates localized public paths from the public page list', () => {
    const paths = publicLocalizedPaths()

    expect(paths).toContain('/')
    expect(paths).toContain('/pricing')
    expect(paths).toContain('/help')
    expect(paths).toContain('/about')
    expect(paths).toContain('/news')
    expect(paths).toContain('/en')
    expect(paths).toContain('/en/pricing')
    expect(paths).toContain('/en/about')
    expect(paths).toContain('/en/help')
    expect(paths).toContain('/en/news')
    expect(paths).toHaveLength(PUBLIC_PAGE_PATHS.length * SUPPORTED_LOCALES.length)
  })
})
