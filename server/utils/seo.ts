import type { ApiResponse } from '../../app/lib/http/types'
import { DEFAULT_SITE_URL, SUPPORTED_LOCALES } from '../../config/site'
import { localizedPath, publicLocalizedPaths } from '../../config/routes'

export type SitemapEntry = {
  loc: string
}

const FALLBACK_NEWS_SLUGS = [
  'starter-release',
  'deployment-guide',
  'i18n-routing',
  'auth-module'
] as const

const xmlEscape = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

export const normalizeSiteUrl = (siteUrl?: string) => {
  const normalized = siteUrl?.trim().replace(/\/+$/, '')
  return normalized || DEFAULT_SITE_URL
}

const absoluteUrl = (siteUrl: string, path: string) => `${normalizeSiteUrl(siteUrl)}${path}`

const publicContentDetailPaths = (slugs: readonly string[]) =>
  SUPPORTED_LOCALES.flatMap((locale) => slugs.map((slug) => localizedPath(`/news/${slug}`, locale)))

export const fetchNewsSlugs = async (apiBase: string) => {
  try {
    const response = await $fetch<ApiResponse<{ articles: { slug: string }[] }>>('/content/news', {
      baseURL: apiBase,
      headers: {
        'accept-language': 'zh-CN'
      }
    })

    return response.data.articles.map((article) => article.slug)
  } catch {
    return [...FALLBACK_NEWS_SLUGS]
  }
}

export const getSitemapEntries = (
  siteUrl?: string,
  newsSlugs: readonly string[] = FALLBACK_NEWS_SLUGS
): SitemapEntry[] => {
  const paths = [...publicLocalizedPaths(), ...publicContentDetailPaths(newsSlugs)]

  return paths.map((path) => ({
    loc: absoluteUrl(normalizeSiteUrl(siteUrl), path)
  }))
}

export const buildSitemapXml = (siteUrl?: string, newsSlugs?: readonly string[]) => {
  const urls = getSitemapEntries(siteUrl, newsSlugs)
    .map((entry) => `  <url>\n    <loc>${xmlEscape(entry.loc)}</loc>\n  </url>`)
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

export const buildSitemapXmlAsync = async (siteUrl?: string, apiBase?: string) => {
  const newsSlugs = apiBase ? await fetchNewsSlugs(apiBase) : [...FALLBACK_NEWS_SLUGS]
  return buildSitemapXml(siteUrl, newsSlugs)
}

export const buildRobotsTxt = (siteUrl?: string) => {
  const normalizedSiteUrl = normalizeSiteUrl(siteUrl)

  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /workspace',
    'Disallow: /workspace/',
    'Disallow: /docs/',
    'Disallow: /account',
    'Disallow: /en/workspace',
    'Disallow: /en/workspace/',
    'Disallow: /en/docs/',
    'Disallow: /en/account',
    'Disallow: /sign-in',
    'Disallow: /en/sign-in',
    'Disallow: /sign-up',
    'Disallow: /en/sign-up',
    '',
    `Sitemap: ${normalizedSiteUrl}/sitemap.xml`,
    ''
  ].join('\n')
}
