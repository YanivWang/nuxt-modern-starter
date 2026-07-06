import { describe, expect, it, vi } from 'vitest'
import { fetchNewsArticles, fetchPricingPage, getFaqItems } from '../../app/apis/public/content'
import { createPublicApiClient } from '../../app/apis/public/client'

vi.mock('../../app/apis/public/client', () => ({
  createPublicApiClient: vi.fn()
}))

describe('public content API', () => {
  it('returns localized FAQ items from the public content boundary', () => {
    const zhItems = getFaqItems('zh-CN')
    const enItems = getFaqItems('en-US')

    expect(zhItems.length).toBeGreaterThan(0)
    expect(enItems.length).toBe(zhItems.length)
    expect(zhItems[0]).toEqual(
      expect.objectContaining({
        key: expect.any(String),
        question: expect.any(String),
        answer: expect.any(String)
      })
    )
    expect(zhItems[0].question).not.toBe(enItems[0].question)
  })

  it('fetches localized news list from the public API boundary', async () => {
    const request = vi.fn().mockResolvedValue({
      code: 200,
      message: '获取新闻列表成功',
      data: {
        articles: [
          {
            slug: 'starter-release',
            title: 'Nuxt Modern Starter v0.1 正式发布',
            description: '首个公开版本聚焦营销页、内容页、SEO、多语言与可选鉴权。',
            publishedAt: '2026-07-04'
          }
        ]
      }
    })

    vi.mocked(createPublicApiClient).mockReturnValue({ request })

    const response = await fetchNewsArticles('zh-CN')

    expect(createPublicApiClient).toHaveBeenCalledWith({ locale: 'zh-CN' })
    expect(request).toHaveBeenCalledWith('/content/news', { method: 'GET' })
    expect(response.data.articles[0]).toEqual(
      expect.objectContaining({
        slug: 'starter-release',
        title: expect.any(String),
        description: expect.any(String),
        publishedAt: expect.any(String)
      })
    )
  })

  it('fetches localized pricing page content from the public API boundary', async () => {
    const request = vi.fn().mockResolvedValue({
      code: 200,
      message: '获取定价页内容成功',
      data: {
        pricing: {
          eyebrow: '使用方案',
          title: '按团队规模选择合适的起步方式',
          lead: '以下方案展示 Nuxt Modern Starter 在不同场景下的推荐用法。',
          note: '价格仅为示例结构。',
          plans: [
            {
              key: 'growth',
              featured: true,
              ctaPath: '/help',
              name: 'Growth',
              badge: '团队推荐',
              price: '推荐',
              period: '完整能力',
              description: '适合需要账号体系的小团队产品前台。',
              cta: '查看能力清单',
              features: ['场景化 API client 与 Bearer Token 鉴权']
            }
          ],
          includes: {
            eyebrow: '所有方案共同包含',
            title: '一套可复用的公开站点基础能力',
            items: ['Nuxt 4、Vue 3、SCSS 设计 token 与 Ant Design Vue 组件体系']
          }
        }
      }
    })

    vi.mocked(createPublicApiClient).mockReturnValue({ request })

    const response = await fetchPricingPage('zh-CN')

    expect(createPublicApiClient).toHaveBeenCalledWith({ locale: 'zh-CN' })
    expect(request).toHaveBeenCalledWith('/content/pricing', { method: 'GET' })
    expect(response.data.pricing.plans[0]).toEqual(
      expect.objectContaining({
        key: 'growth',
        featured: true,
        ctaPath: '/help'
      })
    )
  })
})
