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
import type { ApiPagination, ApiResponse } from '../../app/lib/http/types'
import {
  DEFAULT_LOCALE,
  DEFAULT_SITE_URL,
  SITE_LOCALE_PREFIX_MAP,
  SUPPORTED_LOCALES
} from '../../config/site'
import {
  NEWS_PAGE_SIZE,
  localizedPath,
  newsArchivePath,
  newsTotalPages,
  publicLocalizedPaths
} from '../../config/routes'

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
 * 新闻归档页路径：/news/page/2 起。
 *
 * 第 1 页不在其中 —— 它的 canonical 是 /news 本身，收录 /news/page/1 会制造重复内容。
 * 见 config/routes.ts canonicalRequestPath 里的归档首页规则。
 */
const publicNewsArchivePaths = (totalArticles: number, pageSize: number) => {
  const totalPages = newsTotalPages(totalArticles, pageSize)

  return SUPPORTED_LOCALES.flatMap((locale) =>
    Array.from({ length: totalPages - 1 }, (_, index) =>
      localizedPath(newsArchivePath(index + 2), locale)
    )
  )
}

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

/**
 * 单次请求的条数，取后端 limit 上限。
 * sitemap 要的是全量 slug，每次多拿一些就少发几次请求；上限由后端 schema 卡着，
 * 传超了会 400 而不是被静默截断。
 */
const NEWS_SLUGS_PAGE_SIZE = 100

/**
 * 翻页次数上限，纯粹是熔断。
 *
 * 正常情况下循环由 hasMore 终止。设这个上限是防一种具体故障：
 * 后端若因为 bug 恒返回 hasMore=true，这里会变成一个打爆后端的死循环，
 * 而它跑在每次 /sitemap.xml 请求里。宁可 sitemap 少收录，也不能把后端拖垮。
 */
const NEWS_SLUGS_MAX_PAGES = 50

export type NewsIndex = {
  slugs: string[]
  /** 文章总数，用于算出归档页数；fallback 时等于 slugs.length。 */
  total: number
}

/**
 * 拉取全量新闻 slug。
 *
 * 后端 /content/news 是分页的，必须翻到 hasMore=false —— 只取第一页的话，
 * sitemap 会静默截断到 20 条，而它每一页单独看都是「对的」，
 * 只有对着后端总数比一遍才看得出来少收录了。
 */
export const fetchNewsSlugs = async (apiBase: string, now = Date.now()): Promise<NewsIndex> => {
  if (newsSlugsCache && newsSlugsCache.expiresAt > now) {
    return { slugs: [...newsSlugsCache.slugs], total: newsSlugsCache.slugs.length }
  }

  try {
    const slugs: string[] = []
    let offset = 0
    let total = 0

    for (let page = 0; page < NEWS_SLUGS_MAX_PAGES; page += 1) {
      const response = await $fetch<
        ApiResponse<{ articles: { slug: string }[]; pagination: ApiPagination }>
      >('/content/news', {
        baseURL: apiBase,
        query: { limit: NEWS_SLUGS_PAGE_SIZE, offset },
        headers: {
          'accept-language': 'zh-CN'
        }
      })

      slugs.push(...response.data.articles.map((article) => article.slug))
      total = response.data.pagination.total

      if (!response.data.pagination.hasMore || response.data.articles.length === 0) break
      offset += response.data.articles.length
    }

    newsSlugsCache = { slugs, expiresAt: now + NEWS_SLUGS_TTL_MS }

    return { slugs: [...slugs], total }
  } catch {
    // API 不可用时用静态 fallback，保证 sitemap 仍可生成；不写缓存，后端恢复后立即回到真实数据
    return { slugs: [...FALLBACK_NEWS_SLUGS], total: FALLBACK_NEWS_SLUGS.length }
  }
}

/** 仅供测试重置进程内缓存 */
export const resetNewsSlugsCacheForTests = () => {
  newsSlugsCache = null
}

export const getSitemapEntries = (
  siteUrl?: string,
  newsSlugs: readonly string[] = FALLBACK_NEWS_SLUGS,
  totalArticles = newsSlugs.length
): SitemapEntry[] => {
  const paths = [
    ...publicLocalizedPaths(),
    ...publicContentDetailPaths(newsSlugs),
    ...publicNewsArchivePaths(totalArticles, NEWS_PAGE_SIZE)
  ]

  return paths.map((path) => ({
    loc: absoluteUrl(normalizeSiteUrl(siteUrl), path)
  }))
}

export const buildSitemapXml = (
  siteUrl?: string,
  newsSlugs?: readonly string[],
  totalArticles?: number
) => {
  const urls = getSitemapEntries(siteUrl, newsSlugs, totalArticles)
    .map((entry) => `  <url>\n    <loc>${xmlEscape(entry.loc)}</loc>\n  </url>`)
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

export const buildSitemapXmlAsync = async (siteUrl?: string, apiBase?: string) => {
  const index = apiBase
    ? await fetchNewsSlugs(apiBase)
    : { slugs: [...FALLBACK_NEWS_SLUGS], total: FALLBACK_NEWS_SLUGS.length }
  return buildSitemapXml(siteUrl, index.slugs, index.total)
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
