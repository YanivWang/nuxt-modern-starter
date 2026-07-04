import { faqItems } from '../../config/content/faq'
import { getNewsArticle, newsArticles } from '../../config/content/news'
import type { SupportedLocale } from '../../config/site'

export const getFaqItems = (locale: SupportedLocale) =>
  faqItems.map((item) => ({
    key: item.key,
    question: item.question[locale],
    answer: item.answer[locale]
  }))

export const getNewsArticles = (locale: SupportedLocale) =>
  newsArticles.map((article) => ({
    slug: article.slug,
    title: article.title[locale],
    description: article.description[locale],
    publishedAt: article.publishedAt
  }))

export const getLocalizedNewsArticle = (slug: string, locale: SupportedLocale) => {
  const article = getNewsArticle(slug)

  if (!article) {
    return undefined
  }

  return {
    slug: article.slug,
    title: article.title[locale],
    description: article.description[locale],
    body: article.body[locale],
    publishedAt: article.publishedAt
  }
}
