/*
  【文件职责】
    单测：server/utils/seo sitemap / robots 生成与公开页边界。

  【架构位置】
    tests/unit — server 层纯函数，无 Nitro 请求。

  【主要导出 / 路由】
    describe SEO server route helpers

  【依赖关系】
    - 依赖：server/utils/seo.ts
    - mock：无（news slug 用 fallback）

  【渲染 / 数据】
    无

  【边界与注意】
    不覆盖 GET /sitemap.xml handler；断言不含 workspace/docs/sign-in。
*/
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  buildRobotsTxt,
  buildSitemapXml,
  getSitemapEntries,
  normalizeSiteUrl,
  fetchNewsSlugs,
  resetNewsSlugsCacheForTests
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
    expect(urls).toContain('https://example.com/kr/news')
    expect(urls).toContain('https://example.com/news/starter-release')
    expect(urls).toContain('https://example.com/en/news/starter-release')
    expect(urls.some((url) => url.includes('/workspace'))).toBe(false)
    expect(urls.some((url) => url.includes('/docs/'))).toBe(false)
    expect(urls.some((url) => url.endsWith('/sign-in'))).toBe(false)
    expect(urls.some((url) => url.endsWith('/sign-up'))).toBe(false)
  })

  it('renders sitemap XML and robots rules with product routes excluded', () => {
    const sitemap = buildSitemapXml('https://example.com')
    const robots = buildRobotsTxt('https://example.com')

    expect(sitemap).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    expect(sitemap).toContain('<loc>https://example.com/en/help</loc>')
    expect(sitemap).not.toContain('/workspace')
    expect(sitemap).not.toContain('/docs/')

    expect(robots).toContain('User-agent: *')
    expect(robots).toContain('Disallow: /workspace')
    expect(robots).toContain('Disallow: /docs/')
    expect(robots).toContain('Disallow: /account')
    expect(robots).toContain('Disallow: /en/workspace')
    expect(robots).toContain('Disallow: /sign-in')
    expect(robots).toContain('Disallow: /sign-up')
    expect(robots).toContain('Sitemap: https://example.com/sitemap.xml')
  })
})

describe('news slug cache', () => {
  beforeEach(() => {
    resetNewsSlugsCacheForTests()
  })

  it('reuses the cached slugs instead of calling the backend on every sitemap request', async () => {
    // /sitemap.xml 是公开端点；后端限流按 IP 计，整个 SSR 服务器只算一个客户端，
    // 不缓存的话任何人反复拉 sitemap 都在烧全站共享的那份配额。
    const $fetch = vi.fn().mockResolvedValue({
      code: 200,
      message: 'ok',
      data: { articles: [{ slug: 'a' }, { slug: 'b' }] }
    })
    vi.stubGlobal('$fetch', $fetch)

    await expect(fetchNewsSlugs('http://api.test/api/v1')).resolves.toEqual(['a', 'b'])
    await expect(fetchNewsSlugs('http://api.test/api/v1')).resolves.toEqual(['a', 'b'])

    expect($fetch).toHaveBeenCalledTimes(1)

    // TTL 过后重新拉取
    await fetchNewsSlugs('http://api.test/api/v1', Date.now() + 61 * 60 * 1000)
    expect($fetch).toHaveBeenCalledTimes(2)

    vi.unstubAllGlobals()
  })

  it('does not cache the fallback, so recovery takes effect immediately', async () => {
    const $fetch = vi.fn().mockRejectedValue(new Error('backend down'))
    vi.stubGlobal('$fetch', $fetch)

    const first = await fetchNewsSlugs('http://api.test/api/v1')
    expect(first.length).toBeGreaterThan(0)

    // 后端恢复：下一次就该拿真实数据，而不是继续用一小时的兜底列表
    $fetch.mockResolvedValue({ code: 200, message: 'ok', data: { articles: [{ slug: 'live' }] } })
    await expect(fetchNewsSlugs('http://api.test/api/v1')).resolves.toEqual(['live'])

    vi.unstubAllGlobals()
  })
})
