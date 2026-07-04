import {
  DEFAULT_LOCALE,
  DEFAULT_SEO,
  SITE_NAME,
  SUPPORTED_LOCALES,
  type SupportedLocale
} from '../../config/site'
import { i18n } from '../../i18n'
import { localizedPath } from '../../config/routes'

type PageSeoInput = {
  title?: string
  description?: string
  path: string
  locale?: SupportedLocale
  ogImage?: string
  noindex?: boolean
  article?: {
    title: string
    description: string
    publishedAt: string
  }
}

const absoluteUrl = (siteUrl: string, path: string) =>
  `${siteUrl.replace(/\/$/, '')}${path === '/' ? '' : path}`

const getLocaleMessage = (locale: SupportedLocale, key: string) => {
  const value = key.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object' && part in acc) {
      return (acc as Record<string, unknown>)[part]
    }

    return undefined
  }, i18n.global.getLocaleMessage(locale))

  return typeof value === 'string' ? value : undefined
}

export const usePageSeo = (input: PageSeoInput) => {
  const runtimeConfig = useRuntimeConfig()
  const locale = input.locale || useLanguageStore().currentLanguage || DEFAULT_LOCALE
  const title = input.title ? `${input.title} · ${SITE_NAME}` : DEFAULT_SEO.title
  const description =
    input.description ||
    getLocaleMessage(locale, 'seo.defaultDescription') ||
    DEFAULT_SEO.description
  const siteUrl = runtimeConfig.public.siteUrl || 'http://localhost:3000'
  const canonicalPath = localizedPath(input.path, locale)
  const canonical = absoluteUrl(siteUrl, canonicalPath)
  const ogImage = absoluteUrl(siteUrl, input.ogImage || DEFAULT_SEO.ogImage)

  useHead({
    title,
    meta: [
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: ogImage },
      { property: 'og:url', content: canonical },
      { property: 'og:locale', content: locale },
      ...(input.noindex ? [{ name: 'robots', content: 'noindex,nofollow' }] : [])
    ],
    link: [
      { rel: 'canonical', href: canonical },
      ...SUPPORTED_LOCALES.map((targetLocale) => ({
        rel: 'alternate',
        hreflang: targetLocale,
        href: absoluteUrl(siteUrl, localizedPath(input.path, targetLocale))
      })),
      {
        rel: 'alternate',
        hreflang: 'x-default',
        href: absoluteUrl(siteUrl, localizedPath(input.path, DEFAULT_LOCALE))
      }
    ],
    script: input.article
      ? [
          {
            type: 'application/ld+json',
            innerHTML: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Article',
              headline: input.article.title,
              description: input.article.description,
              datePublished: input.article.publishedAt,
              mainEntityOfPage: canonical
            })
          }
        ]
      : []
  })

  return {
    title,
    description,
    canonical
  }
}
