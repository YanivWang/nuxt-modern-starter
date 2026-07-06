import { DEFAULT_SITE_URL, SUPPORTED_LOCALES } from '../../config/site'
import { newsArticles } from '../../config/content/news'
import { localizedPath, publicLocalizedPaths } from '../../config/routes'

export type SitemapEntry = {
  loc: string
}

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

const publicContentDetailPaths = () =>
  SUPPORTED_LOCALES.flatMap((locale) =>
    newsArticles.map((article) => localizedPath(`/news/${article.slug}`, locale))
  )

export const getSitemapEntries = (siteUrl?: string): SitemapEntry[] => {
  const paths = [...publicLocalizedPaths(), ...publicContentDetailPaths()]

  return paths.map((path) => ({
    loc: absoluteUrl(normalizeSiteUrl(siteUrl), path)
  }))
}

export const buildSitemapXml = (siteUrl?: string) => {
  const urls = getSitemapEntries(siteUrl)
    .map((entry) => `  <url>\n    <loc>${xmlEscape(entry.loc)}</loc>\n  </url>`)
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
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
