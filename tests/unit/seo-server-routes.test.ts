import { describe, expect, it } from 'vitest'
import {
  buildRobotsTxt,
  buildSitemapXml,
  getSitemapEntries,
  normalizeSiteUrl
} from '../../server/utils/seo'

describe('SEO server route helpers', () => {
  it('normalizes site URLs without trailing slashes', () => {
    expect(normalizeSiteUrl('https://example.com/')).toBe('https://example.com')
    expect(normalizeSiteUrl('')).toBe('https://example.com')
  })

  it('builds sitemap entries only from public localized paths', () => {
    const entries = getSitemapEntries('https://example.com/')
    const urls = entries.map((entry) => entry.loc)

    expect(urls).toContain('https://example.com/')
    expect(urls).toContain('https://example.com/pricing')
    expect(urls).toContain('https://example.com/en/news')
    expect(urls).toContain('https://example.com/news/starter-release')
    expect(urls).toContain('https://example.com/en/news/starter-release')
    expect(urls.some((url) => url.includes('/app/'))).toBe(false)
    expect(urls.some((url) => url.endsWith('/login'))).toBe(false)
    expect(urls.some((url) => url.endsWith('/register'))).toBe(false)
  })

  it('renders sitemap XML and robots rules with product routes excluded', () => {
    const sitemap = buildSitemapXml('https://example.com')
    const robots = buildRobotsTxt('https://example.com')

    expect(sitemap).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    expect(sitemap).toContain('<loc>https://example.com/en/help</loc>')
    expect(sitemap).not.toContain('/app/')

    expect(robots).toContain('User-agent: *')
    expect(robots).toContain('Disallow: /app/')
    expect(robots).toContain('Disallow: /en/app/')
    expect(robots).toContain('Disallow: /login')
    expect(robots).toContain('Disallow: /register')
    expect(robots).toContain('Sitemap: https://example.com/sitemap.xml')
  })
})
