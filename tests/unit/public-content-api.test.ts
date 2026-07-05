import { describe, expect, it } from 'vitest'
import {
  getFaqItems,
  getLocalizedNewsArticle,
  getNewsArticles
} from '../../app/apis/public/content'

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

  it('returns localized news list and article details without auth state', () => {
    const [article] = getNewsArticles('zh-CN')

    expect(article).toEqual(
      expect.objectContaining({
        slug: expect.any(String),
        title: expect.any(String),
        description: expect.any(String),
        publishedAt: expect.any(String)
      })
    )
    expect(getLocalizedNewsArticle(article.slug, 'zh-CN')).toEqual(
      expect.objectContaining({
        slug: article.slug,
        title: article.title,
        body: expect.any(Array)
      })
    )
  })
})
