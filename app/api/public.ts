/*
  【文件职责】
    公开内容 API adapter：新闻、定价远程拉取；FAQ 本地 config 读取。
    全部经 createPublicApiClient，按 locale 注入 accept-language。

  【架构位置】
    共享层 — app/api，供公开 SEO 页面（pricing、news、help）消费。

  【主要导出 / 路由】
    getFaqItems、fetchNewsArticles、fetchLocalizedNewsArticle、fetchPricingPage

  【依赖关系】
    - 依赖：app/api/clients.ts、config/content/faq.ts、config/site.ts（SITE_CONTENT_LOCALE_MAP）
    - 被引用：app/pages/[[language]]/pricing.vue、news/*、help.vue

  【渲染 / 数据】
    adapter 相对路径：/content/news、/content/news/:slug、/content/pricing。
    页面注释可写完整路径 GET /api/v1/content/pricing（便于联调）。

  【边界与注意】
    FAQ 不经远程 API；新闻 / 定价走 Public client，适合 SSR 公开页（不经 token）。
    远程内容只有 zh-CN / en-US 两种语言，站点其余 13 个语言按 SITE_CONTENT_LOCALE_MAP 回退；
    不做映射的话，后端会把它们全部落到 zh-CN，页面外壳是本地语言而正文是中文。
*/
import type { ApiResponse } from '../lib/http/types'
import { faqItems, resolveLocalizedContent } from '../../config/content/faq'
import { SITE_CONTENT_LOCALE_MAP, type SupportedLocale } from '../../config/site'
import { createPublicApiClient } from './clients'

/**
 * 站点 15 个语言 → 后端内容只有 2 个。映射表与理由见 config/site.ts SITE_CONTENT_LOCALE_MAP。
 *
 * locale 同时以 query 与 accept-language 两种方式传出：query 是后端显式校验的枚举参数
 * （传错会 400，问题当场暴露），accept-language 只是它的兜底信号，两者必须一致，
 * 否则日后有人改动其中一条就会得到两个互相矛盾的语言意图。
 */
const contentLocaleOf = (locale: SupportedLocale) => SITE_CONTENT_LOCALE_MAP[locale]

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

export const fetchNewsArticles = (locale: SupportedLocale) => {
  const contentLocale = contentLocaleOf(locale)

  return createPublicApiClient({ locale: contentLocale }).request<
    ApiResponse<{ articles: LocalizedNewsArticleSummary[] }>
  >('/content/news', {
    method: 'GET',
    query: { locale: contentLocale }
  })
}

export const fetchLocalizedNewsArticle = (slug: string, locale: SupportedLocale) => {
  const contentLocale = contentLocaleOf(locale)

  return createPublicApiClient({ locale: contentLocale }).request<
    ApiResponse<{ article: LocalizedNewsArticle }>
  >(`/content/news/${slug}`, {
    method: 'GET',
    query: { locale: contentLocale }
  })
}

export const fetchPricingPage = (locale: SupportedLocale) => {
  const contentLocale = contentLocaleOf(locale)

  return createPublicApiClient({ locale: contentLocale }).request<
    ApiResponse<{ pricing: PricingPageContent }>
  >('/content/pricing', {
    method: 'GET',
    query: { locale: contentLocale }
  })
}
