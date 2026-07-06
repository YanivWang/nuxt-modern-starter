import type { ApiResponse } from '../../api-core/api-types'
import { faqItems } from '../../../config/content/faq'
import type { SupportedLocale } from '../../../config/site'
import { createPublicApiClient } from './client'

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
  faqItems.map((item) => ({
    key: item.key,
    question: item.question[locale],
    answer: item.answer[locale]
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
