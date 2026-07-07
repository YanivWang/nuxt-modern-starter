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
import { fetchNewsArticles, fetchPricingPage, getFaqItems } from '../../app/api/public'
import { createPublicApiClient } from '../../app/api/clients'

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

  it('fetches news articles through the public client', async () => {
    const request = vi.fn().mockResolvedValue({
      code: 200,
      message: 'ok',
      data: { articles: [] }
    })
    vi.mocked(createPublicApiClient).mockReturnValue({ request })

    await fetchNewsArticles('en-US')

    expect(createPublicApiClient).toHaveBeenCalledWith({ locale: 'en-US' })
    expect(request).toHaveBeenCalledWith('/content/news', { method: 'GET' })
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
    expect(request).toHaveBeenCalledWith('/content/pricing', { method: 'GET' })
  })
})
