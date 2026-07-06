import {
  DEFAULT_LOCALE,
  DEFAULT_SEO,
  SITE_NAME,
  SITE_ORG,
  SUPPORTED_LOCALES,
  type SupportedLocale
} from '../../config/site'
import { i18n } from '../../i18n'
import { localizedPath } from '../../config/routes'

/** 页面调用 usePageSeo({ ... }) 时使用 */
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
  webPage?: boolean
  includeOrganization?: boolean
  siteVerification?: { baidu?: string; google?: string }
}

type PageSeoLinkInput = Pick<PageSeoInput, 'path' | 'locale' | 'noindex'> & {
  siteUrl: string
}

/** buildPageSeoMeta(input) — 内部纯函数入参（title/description 为已解析的 resolved 值） */
type PageSeoMetaInput = {
  siteUrl: string
  siteName: string
  title: string
  description: string
  canonical: string
  ogImage: string
  locale: SupportedLocale
  noindex?: boolean
  article?: PageSeoInput['article']
  siteVerification?: PageSeoInput['siteVerification']
}

/** buildPageSeoScripts(input) — 内部纯函数入参 */
type PageSeoScriptsInput = {
  siteUrl: string
  canonical: string
  title?: string
  description?: string
  article?: PageSeoInput['article']
  webPage?: boolean
  includeOrganization?: boolean
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

export const buildPageSeoLinks = (input: PageSeoLinkInput) => {
  const locale = input.locale || DEFAULT_LOCALE
  const canonical = absoluteUrl(input.siteUrl, localizedPath(input.path, locale))
  const canonicalLink = { rel: 'canonical', href: canonical }

  if (input.noindex) {
    return [canonicalLink]
  }

  return [
    canonicalLink,
    ...SUPPORTED_LOCALES.map((targetLocale) => ({
      rel: 'alternate',
      hreflang: targetLocale,
      href: absoluteUrl(input.siteUrl, localizedPath(input.path, targetLocale))
    })),
    {
      rel: 'alternate',
      hreflang: 'x-default',
      href: absoluteUrl(input.siteUrl, localizedPath(input.path, DEFAULT_LOCALE))
    }
  ]
}

export const buildPageSeoMeta = (input: PageSeoMetaInput) => {
  const ogType = input.article ? 'article' : 'website'

  const meta: Array<Record<string, string>> = [
    { name: 'description', content: input.description },
    { property: 'og:title', content: input.title },
    { property: 'og:description', content: input.description },
    { property: 'og:image', content: input.ogImage },
    { property: 'og:url', content: input.canonical },
    { property: 'og:locale', content: input.locale },
    { property: 'og:type', content: ogType },
    { property: 'og:site_name', content: input.siteName },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: input.title },
    { name: 'twitter:description', content: input.description },
    { name: 'twitter:image', content: input.ogImage },
    ...(input.noindex ? [{ name: 'robots', content: 'noindex,nofollow' }] : [])
  ]

  const googleToken = input.siteVerification?.google?.trim()
  if (googleToken) {
    meta.push({ name: 'google-site-verification', content: googleToken })
  }

  const baiduToken = input.siteVerification?.baidu?.trim()
  if (baiduToken) {
    meta.push({ name: 'baidu-site-verification', content: baiduToken })
  }

  return meta
}

export const buildPageSeoScripts = (input: PageSeoScriptsInput) => {
  const scripts: Array<{ type: string; innerHTML: string }> = []

  if (input.article) {
    scripts.push({
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: input.article.title,
        description: input.article.description,
        datePublished: input.article.publishedAt,
        mainEntityOfPage: input.canonical
      })
    })
  }

  if (input.webPage) {
    scripts.push({
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: input.title,
        description: input.description,
        url: input.canonical
      })
    })
  }

  if (input.includeOrganization) {
    scripts.push({
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SITE_ORG.name,
        url: absoluteUrl(input.siteUrl, '/'),
        logo: absoluteUrl(input.siteUrl, SITE_ORG.logo)
      })
    })
  }

  return scripts
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
    meta: buildPageSeoMeta({
      siteUrl,
      siteName: SITE_NAME,
      title,
      description,
      canonical,
      ogImage,
      locale,
      noindex: input.noindex,
      article: input.article,
      siteVerification: input.siteVerification
    }),
    link: buildPageSeoLinks({ siteUrl, path: input.path, locale, noindex: input.noindex }),
    script: buildPageSeoScripts({
      siteUrl,
      canonical,
      title,
      description,
      article: input.article,
      webPage: input.webPage,
      includeOrganization: input.includeOrganization
    })
  })

  return {
    title,
    description,
    canonical
  }
}
