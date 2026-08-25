/*
  【文件职责】
    sitemap.xml 与 robots.txt 生成逻辑：公开多语言路径展开、新闻 slug 动态拉取、XML 转义。
    robots 显式 Disallow 产品区、鉴权页，以及它们在全部非默认语言前缀下的变体
    （/en、/kr、/zh-hk … 见 SITE_LOCALE_PREFIX_MAP）；sitemap 仅含 PUBLIC_PAGE_PATHS 展开路径。

  【架构位置】
    server 层 — 被 server/routes/sitemap.xml.ts、server/routes/robots.txt.ts 调用。

  【主要导出 / 路由】
    buildSitemapXml、buildSitemapXmlAsync、buildRobotsTxt、getSitemapEntries、
    fetchNewsSlugs、normalizeSiteUrl

  【依赖关系】
    - 依赖：config/site.ts、config/routes.ts、runtimeConfig.public.apiBase（新闻 slug）
    - 被引用：server/routes/sitemap.xml.ts、server/routes/robots.txt.ts、tests/unit/seo-server-routes.test.ts

  【渲染 / 数据】
    Nitro 路由 GET /sitemap.xml、GET /robots.txt；新闻 slug API 失败时 fallback 到 FALLBACK_NEWS_SLUGS。

  【边界与注意】
    sitemap 不含 /workspace、/docs/**、/sign-in、/sign-up；与 usePageSeo hreflang 公开页集合一致。
    siteUrl 来自 runtimeConfig.public.siteUrl，空值 fallback DEFAULT_SITE_URL。
*/
import type { ApiResponse } from '../../app/lib/http/types'
import {
  DEFAULT_LOCALE,
  DEFAULT_SITE_URL,
  SITE_LOCALE_PREFIX_MAP,
  SUPPORTED_LOCALES
} from '../../config/site'
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
    // API 不可用时用静态 fallback，保证 sitemap 仍可生成
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

const localizedAuthDisallowRules = () => {
  const nonDefaultPrefixes = SUPPORTED_LOCALES.filter((locale) => locale !== DEFAULT_LOCALE).map(
    (locale) => SITE_LOCALE_PREFIX_MAP[locale]
  )

  return nonDefaultPrefixes.flatMap((prefix) => [
    `Disallow: /${prefix}/workspace`,
    `Disallow: /${prefix}/workspace/`,
    `Disallow: /${prefix}/docs/`,
    `Disallow: /${prefix}/account`,
    `Disallow: /${prefix}/sign-in`,
    `Disallow: /${prefix}/sign-up`
  ])
}

export const buildRobotsTxt = (siteUrl?: string) => {
  const normalizedSiteUrl = normalizeSiteUrl(siteUrl)

  // 产品区、鉴权页 noindex；同时 block 各语言前缀变体以防爬虫收录带前缀 URL
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /workspace',
    'Disallow: /workspace/',
    'Disallow: /docs/',
    'Disallow: /account',
    ...localizedAuthDisallowRules(),
    'Disallow: /sign-in',
    'Disallow: /sign-up',
    '',
    `Sitemap: ${normalizedSiteUrl}/sitemap.xml`,
    ''
  ].join('\n')
}
