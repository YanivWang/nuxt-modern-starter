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
    新闻 slug 带 1 小时进程内缓存，避免公开的 /sitemap.xml 把后端按 IP 计的配额烧光，
    见 fetchNewsSlugs。
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

/**
 * 新闻 slug 的进程内缓存。
 *
 * /sitemap.xml 是公开、无需登录的端点，而它每被请求一次就要向后端发一次 /content/news。
 * 后端限流按 IP 计数，从它的视角看整个 SSR 服务器只是一个客户端 ——
 * 于是任何人反复拉 sitemap 都在消耗全站 SSR 共享的那一份后端配额。
 * slug 集合变化频率以天计，缓存一小时既不影响收录，也让请求量与爬虫频率脱钩。
 *
 * 失败结果不缓存：后端恢复后下一次请求就该拿到真实数据，而不是继续用一小时的兜底列表。
 */
const NEWS_SLUGS_TTL_MS = 60 * 60 * 1000
let newsSlugsCache: { slugs: string[]; expiresAt: number } | null = null

export const fetchNewsSlugs = async (apiBase: string, now = Date.now()) => {
  if (newsSlugsCache && newsSlugsCache.expiresAt > now) {
    return [...newsSlugsCache.slugs]
  }

  try {
    const response = await $fetch<ApiResponse<{ articles: { slug: string }[] }>>('/content/news', {
      baseURL: apiBase,
      headers: {
        'accept-language': 'zh-CN'
      }
    })

    const slugs = response.data.articles.map((article) => article.slug)
    newsSlugsCache = { slugs, expiresAt: now + NEWS_SLUGS_TTL_MS }

    return [...slugs]
  } catch {
    // API 不可用时用静态 fallback，保证 sitemap 仍可生成；不写缓存，后端恢复后立即回到真实数据
    return [...FALLBACK_NEWS_SLUGS]
  }
}

/** 仅供测试重置进程内缓存 */
export const resetNewsSlugsCacheForTests = () => {
  newsSlugsCache = null
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
