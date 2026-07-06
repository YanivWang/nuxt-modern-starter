import { describe, expect, it } from 'vitest'
import { buildPageSeoLinks } from '../../app/composables/usePageSeo'

describe('page seo links', () => {
  it('generates alternate language links for public pages', () => {
    const links = buildPageSeoLinks({
      siteUrl: 'https://example.com',
      path: '/pricing',
      locale: 'zh-CN'
    })

    expect(links).toContainEqual({ rel: 'canonical', href: 'https://example.com/pricing' })
    expect(links).toContainEqual({
      rel: 'alternate',
      hreflang: 'en-US',
      href: 'https://example.com/en/pricing'
    })
  })

  it('does not generate alternate language links for noindex product pages', () => {
    const links = buildPageSeoLinks({
      siteUrl: 'https://example.com',
      path: '/workspace',
      locale: 'en-US',
      noindex: true
    })

    expect(links).toEqual([{ rel: 'canonical', href: 'https://example.com/workspace' }])
  })
})
