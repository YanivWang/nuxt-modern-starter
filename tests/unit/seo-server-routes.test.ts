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

  /** 造一页响应；hasMore 由调用方指定，用来驱动翻页循环。 */
  const newsPage = (slugs: string[], { total, offset }: { total: number; offset: number }) => ({
    code: 200,
    message: 'ok',
    data: {
      articles: slugs.map((slug) => ({ slug })),
      pagination: { total, limit: 100, offset, hasMore: offset + slugs.length < total }
    }
  })

  it('reuses the cached slugs instead of calling the backend on every sitemap request', async () => {
    // /sitemap.xml 是公开端点；后端限流按 IP 计，整个 SSR 服务器只算一个客户端，
    // 不缓存的话任何人反复拉 sitemap 都在烧全站共享的那份配额。
    const $fetch = vi.fn().mockResolvedValue(newsPage(['a', 'b'], { total: 2, offset: 0 }))
    vi.stubGlobal('$fetch', $fetch)

    await expect(fetchNewsSlugs('http://api.test/api/v1')).resolves.toEqual({
      slugs: ['a', 'b'],
      total: 2
    })
    await expect(fetchNewsSlugs('http://api.test/api/v1')).resolves.toEqual({
      slugs: ['a', 'b'],
      total: 2
    })

    expect($fetch).toHaveBeenCalledTimes(1)

    // TTL 过后重新拉取
    await fetchNewsSlugs('http://api.test/api/v1', Date.now() + 61 * 60 * 1000)
    expect($fetch).toHaveBeenCalledTimes(2)

    vi.unstubAllGlobals()
  })

  it('pages through every article instead of stopping at the first page', async () => {
    // 只取第一页的话 sitemap 会静默截断到 20 条 —— 每页单独看都「对」，
    // 只有对着后端总数比一遍才看得出来少收录了。
    const $fetch = vi
      .fn()
      .mockResolvedValueOnce(newsPage(['a', 'b'], { total: 3, offset: 0 }))
      .mockResolvedValueOnce(newsPage(['c'], { total: 3, offset: 2 }))
    vi.stubGlobal('$fetch', $fetch)

    await expect(fetchNewsSlugs('http://api.test/api/v1')).resolves.toEqual({
      slugs: ['a', 'b', 'c'],
      total: 3
    })
    expect($fetch).toHaveBeenCalledTimes(2)
    expect($fetch.mock.calls[1]?.[1]).toMatchObject({ query: { limit: 100, offset: 2 } })

    vi.unstubAllGlobals()
  })

  it('stops paging instead of looping forever when the backend always claims hasMore', async () => {
    // 后端若因为 bug 恒返回 hasMore=true，这个循环跑在每次 /sitemap.xml 请求里，
    // 不设熔断就是一个打爆后端的死循环。宁可少收录也不能把后端拖垮。
    const $fetch = vi.fn().mockResolvedValue({
      code: 200,
      message: 'ok',
      data: {
        articles: [{ slug: 'endless' }],
        pagination: { total: 1_000_000, limit: 100, offset: 0, hasMore: true }
      }
    })
    vi.stubGlobal('$fetch', $fetch)

    const result = await fetchNewsSlugs('http://api.test/api/v1')

    expect($fetch.mock.calls.length).toBeLessThanOrEqual(50)
    expect(result.slugs.length).toBe($fetch.mock.calls.length)

    vi.unstubAllGlobals()
  })

  it('does not cache the fallback, so recovery takes effect immediately', async () => {
    const $fetch = vi.fn().mockRejectedValue(new Error('backend down'))
    vi.stubGlobal('$fetch', $fetch)

    const first = await fetchNewsSlugs('http://api.test/api/v1')
    expect(first.slugs.length).toBeGreaterThan(0)

    // 后端恢复：下一次就该拿真实数据，而不是继续用一小时的兜底列表
    $fetch.mockResolvedValue(newsPage(['live'], { total: 1, offset: 0 }))
    await expect(fetchNewsSlugs('http://api.test/api/v1')).resolves.toEqual({
      slugs: ['live'],
      total: 1
    })

    vi.unstubAllGlobals()
  })
})
