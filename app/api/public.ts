/*
  【文件职责】
    公开内容 API adapter：新闻、定价远程拉取；FAQ 本地 config 读取。
    全部经 createPublicApiClient，按 locale 注入 accept-language。

  【架构位置】
    共享层 — app/api，供公开 SEO 页面（pricing、news、help）消费。

  【主要导出 / 路由】
    getFaqItems、fetchNewsArticles、fetchLocalizedNewsArticle、fetchPricingPage

  【依赖关系】
    - 依赖：app/api/clients.ts、config/content/faq.ts、config/site.ts
    - 被引用：app/pages/[[language]]/pricing.vue、news/*、help.vue

  【渲染 / 数据】
    adapter 相对路径：/content/news、/content/news/:slug、/content/pricing。
    页面注释可写完整路径 GET /api/v1/content/pricing（便于联调）。

  【边界与注意】
    FAQ 不经远程 API；新闻 / 定价走 Public client，适合 SSR 公开页（不经 token）。
*/
import type { ApiResponse } from '../lib/http/types'
import { faqItems, resolveLocalizedContent } from '../../config/content/faq'
import type { SupportedLocale } from '../../config/site'
import { createPublicApiClient } from './clients'

export type LocalizedNewsArticleSummary = {
  slug: string
  title: string
  description: string
  publishedAt: string
}

export type LocalizedNewsArticle = LocalizedNewsArticleSummary & {
  body: string[]
}

export type PricingPlan = {
  key: 'starter' | 'growth' | 'custom'
  featured: boolean
  ctaPath: '/sign-up' | '/help'
  name: string
  badge: string
  price: string
  period: string
  description: string
  cta: string
  features: string[]
}

export type PricingPageContent = {
  eyebrow: string
  title: string
  lead: string
  note: string
  plans: PricingPlan[]
  includes: {
    eyebrow: string
    title: string
    items: string[]
  }
}

export const getFaqItems = (locale: SupportedLocale) =>
  // FAQ 不经远程 API；从 config/content/faq.ts 按 locale 回退 en-US → zh-CN
  faqItems.map((item) => ({
    key: item.key,
    question: resolveLocalizedContent(item.question, locale),
    answer: resolveLocalizedContent(item.answer, locale)
  }))

export const fetchNewsArticles = (locale: SupportedLocale) =>
  createPublicApiClient({ locale }).request<
    ApiResponse<{ articles: LocalizedNewsArticleSummary[] }>
  >('/content/news', {
    method: 'GET'
  })

export const fetchLocalizedNewsArticle = (slug: string, locale: SupportedLocale) =>
  createPublicApiClient({ locale }).request<ApiResponse<{ article: LocalizedNewsArticle }>>(
    `/content/news/${slug}`,
    {
      method: 'GET'
    }
  )

export const fetchPricingPage = (locale: SupportedLocale) =>
  createPublicApiClient({ locale }).request<ApiResponse<{ pricing: PricingPageContent }>>(
    '/content/pricing',
    {
      method: 'GET'
    }
  )
