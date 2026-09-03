/*
  【文件职责】
    单测：app/api/public FAQ 本地读取与 news/pricing Public client 调用。

  【架构位置】
    tests/unit — mock createPublicApiClient。

  【主要导出 / 路由】
    describe public content api

  【依赖关系】
    - 依赖：app/api/public.ts、config/content/faq.ts
    - mock：createPublicApiClient

  【渲染 / 数据】
    无

  【边界与注意】
    不覆盖 SSR useAsyncData 水合；FAQ 不测远程 CMS。
*/
import { describe, expect, it, vi } from 'vitest'
import {
  fetchLocalizedNewsArticle,
  fetchNewsArticles,
  fetchPricingPage,
  getFaqItems
} from '../../app/api/public'
import { createPublicApiClient } from '../../app/api/clients'
import { NEWS_PAGE_SIZE } from '../../config/routes'

vi.mock('../../app/api/clients', () => ({
  createPublicApiClient: vi.fn()
}))

describe('public content api', () => {
  it('returns localized FAQ items from local content', () => {
    const items = getFaqItems('zh-CN')

    expect(items.length).toBeGreaterThan(0)
    expect(items[0]).toMatchObject({
      key: expect.any(String),
      question: expect.any(String),
      answer: expect.any(String)
    })
  })

  it('falls back to English FAQ content for locales without dedicated translations', () => {
    const englishItems = getFaqItems('en-US')
    const frenchItems = getFaqItems('fr-FR')

    expect(frenchItems).toEqual(englishItems)
  })

  it('fetches news articles through the public client', async () => {
    const request = vi.fn().mockResolvedValue({
      code: 200,
      message: 'ok',
      data: { articles: [] }
    })
    vi.mocked(createPublicApiClient).mockReturnValue({ request })

    await fetchNewsArticles('en-US')

    expect(createPublicApiClient).toHaveBeenCalledWith({ locale: 'en-US' })
    // limit/offset 显式传出，不靠前后端默认值撞上：归档页 URL 的页码是按 limit 算的
    expect(request).toHaveBeenCalledWith('/content/news', {
      method: 'GET',
      query: { locale: 'en-US', limit: NEWS_PAGE_SIZE, offset: 0 }
    })
  })

  it('turns a page number into the matching offset', async () => {
    const request = vi.fn().mockResolvedValue({
      code: 200,
      message: 'ok',
      data: { articles: [], pagination: { total: 0, limit: 20, offset: 40, hasMore: false } }
    })
    vi.mocked(createPublicApiClient).mockReturnValue({ request })

    await fetchNewsArticles('en-US', { limit: NEWS_PAGE_SIZE, offset: 2 * NEWS_PAGE_SIZE })

    expect(request).toHaveBeenCalledWith('/content/news', {
      method: 'GET',
      query: { locale: 'en-US', limit: NEWS_PAGE_SIZE, offset: 40 }
    })
  })

  it('asks for English content on locales the backend does not serve', async () => {
    // 后端内容只有 zh-CN / en-US。不映射的话它按 accept-language 判断，
    // 除英文外一律落到 zh-CN —— 法语页面外壳是法语、正文却是中文。
    const request = vi.fn().mockResolvedValue({ code: 200, message: 'ok', data: { articles: [] } })
    vi.mocked(createPublicApiClient).mockReturnValue({ request })

    await fetchNewsArticles('fr-FR')

    expect(createPublicApiClient).toHaveBeenCalledWith({ locale: 'en-US' })
    expect(request).toHaveBeenCalledWith('/content/news', {
      method: 'GET',
      query: { locale: 'en-US', limit: NEWS_PAGE_SIZE, offset: 0 }
    })
  })

  it('fetches a single news article through the public client', async () => {
    const request = vi.fn().mockResolvedValue({
      code: 200,
      message: 'ok',
      data: { article: { slug: 'starter-release', title: 't', description: 'd', body: [] } }
    })
    vi.mocked(createPublicApiClient).mockReturnValue({ request })

    const article = await fetchLocalizedNewsArticle('starter-release', 'de-DE')

    expect(article.data.article.slug).toBe('starter-release')
    // de-DE 后端不提供，按 SITE_CONTENT_LOCALE_MAP 落到 en-US
    expect(createPublicApiClient).toHaveBeenCalledWith({ locale: 'en-US' })
    expect(request).toHaveBeenCalledWith('/content/news/starter-release', {
      method: 'GET',
      query: { locale: 'en-US' }
    })
  })

  it('keeps Traditional Chinese readers on Chinese content', async () => {
    const request = vi.fn().mockResolvedValue({ code: 200, message: 'ok', data: { articles: [] } })
    vi.mocked(createPublicApiClient).mockReturnValue({ request })

    await fetchNewsArticles('zh-HK')

    expect(createPublicApiClient).toHaveBeenCalledWith({ locale: 'zh-CN' })
  })

  it('fetches pricing content through the public client', async () => {
    const request = vi.fn().mockResolvedValue({
      code: 200,
      message: 'ok',
      data: { pricing: { plans: [] } }
    })
    vi.mocked(createPublicApiClient).mockReturnValue({ request })

    await fetchPricingPage('zh-CN')

    expect(createPublicApiClient).toHaveBeenCalledWith({ locale: 'zh-CN' })
    expect(request).toHaveBeenCalledWith('/content/pricing', {
      method: 'GET',
      query: { locale: 'zh-CN' }
    })
  })
})
