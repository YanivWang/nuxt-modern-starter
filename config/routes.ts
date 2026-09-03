/*
  【文件职责】
    路由分区与渲染策略单一来源：产品路径判定、多语言路径展开、prerender / SWR / CSR 规则列表。
    publicLocalizedPaths 从 PUBLIC_PAGE_PATHS 展开全部 SUPPORTED_LOCALES 变体，供 sitemap 与 hreflang 使用。

  【架构位置】
    config 层 — 被 nuxt.config.ts routeRules、locale middleware、useLocalePath、server SEO 工具消费。

  【主要导出 / 路由】
    productRoutePatterns、csrRouteRules、prerenderRoutes、swrRouteRules、
    PRERENDER_BASE_PATHS、PRERENDER_LOCALES、SWR_BASE_PATHS、PublicPagePath、
    isProductPath、localizedProductPathToCanonical、canonicalRequestPath、
    hasTrailingSlash、withoutTrailingSlash、localizedPath、publicLocalizedPaths

  【依赖关系】
    - 依赖：config/site.ts（PUBLIC_PAGE_PATHS、SITE_LOCALE_PREFIX_MAP、DEFAULT_LOCALE）
    - 被引用：nuxt.config.ts、app/middleware/locale.global.ts、server/middleware/canonical-path.ts、
      useLocalePath、server/utils/seo.ts

  【渲染 / 数据】
    prerender：PRERENDER_BASE_PATHS × PRERENDER_LOCALES；SWR：SWR_BASE_PATHS × 全部语言，
    每条展开为「路径本身 + 子树」；/pricing 走默认 SSR；
    CSR（ssr: false）：/workspace/**、/docs/**、/account。

  【边界与注意】
    产品 URL 永不由 localizedPath 加语言前缀；localizedProductPathToCanonical 仅对产品 path 返回 canonical。
    canonicalRequestPath 是「路径规范化」的唯一来源，同时被 SSR 中间件与客户端 middleware 消费，
    两侧规则必须同源，否则首屏与 SPA 导航会给出不同的 canonical URL。
    修改 prerender / SWR / CSR 列表需同步 tests/unit/product-routes.test.ts、tests/unit/seo-routes.test.ts。
*/
import {
  DEFAULT_LOCALE,
  PUBLIC_PAGE_PATHS,
  SITE_LOCALE_PREFIX_MAP,
  SUPPORTED_LOCALES,
  type SupportedLocale
} from './site'

export type PublicPagePath = (typeof PUBLIC_PAGE_PATHS)[number]

/** 用于 nuxt.config routeRules（CSR）与测试断言 */
export const productRoutePatterns = ['/workspace/**', '/docs/**', '/account'] as const

export const csrRouteRules = [...productRoutePatterns]

export const isProductPath = (path: string): boolean => {
  const p = path.startsWith('/') ? path : `/${path}`

  if (p === '/account') return true
  if (p === '/workspace' || p.startsWith('/workspace/')) return true
  if (p === '/docs' || p.startsWith('/docs/')) return true

  return false
}

export const localizedProductPathToCanonical = (path: string): string | null => {
  const segments = path.split('/').filter(Boolean)
  const [firstSegment, ...rest] = segments
  const localePrefixes = Object.values(SITE_LOCALE_PREFIX_MAP)

  if (!firstSegment || !localePrefixes.includes(firstSegment)) {
    return null
  }

  const pathWithoutLocale = rest.length ? `/${rest.join('/')}` : '/'

  return isProductPath(pathWithoutLocale) ? pathWithoutLocale : null
}

/** 非根路径且以 / 结尾时视为尾斜杠，需 301 规范化 */
export const hasTrailingSlash = (path: string) => path.length > 1 && path.endsWith('/')

/** 去除末尾斜杠；全为斜杠时回退为 / */
export const withoutTrailingSlash = (path: string) => path.replace(/\/+$/, '') || '/'

/**
 * 新闻索引每页条数。
 *
 * 放在 config 而不是 adapter 里：归档页 URL（/news/page/N）里的 N 由它算出，
 * 页面、sitemap、canonical 规则三处都要用同一个值。散在 app/ 的话，
 * server 层为拿一个常量就得值导入整个 API adapter。
 *
 * 与后端 DEFAULT_PAGE_LIMIT 同为 20，但请求时显式传出去，不靠双方默认值撞上 ——
 * 一旦哪天两边不再相等，页码与实际内容会静默错位。
 */
export const NEWS_PAGE_SIZE = 20

/** 归档页路径段：/news/page/2。独立成常量，路由文件与 canonical 规则共用。 */
export const NEWS_ARCHIVE_SEGMENT = 'page'

export const newsArchivePath = (page: number) => `/news/${NEWS_ARCHIVE_SEGMENT}/${page}`

/**
 * 从新闻总数算出归档页总数。总数为 0 时仍算 1 页 —— 空列表也要有 /news 可访问。
 */
export const newsTotalPages = (totalArticles: number, pageSize: number = NEWS_PAGE_SIZE) =>
  Math.max(1, Math.ceil(totalArticles / pageSize))

/**
 * /news/page/1 → /news，/en/news/page/1 → /en/news。
 *
 * 第 1 页有两个可达 URL 时，两个都会被收录成同一份内容。归档分页必须只有一个
 * canonical 入口，否则站内出现整页级别的重复内容。sitemap 里也只收 /news 与第 2 页起。
 *
 * 非默认语言前缀要一并处理：这一步跑在「去默认语言前缀」之后，
 * 那一步只摘 zh，/en/news/page/1 到这里仍然带着前缀。只判无前缀形式的话，
 * 14 个非默认语言的归档首页会各自留下一个重复 URL。
 *
 * 只折 page/1：page/2 以上是各自独立的页面，自指 canonical。
 */
const newsArchiveFirstPageToCanonical = (path: string): string | null => {
  if (path === newsArchivePath(1)) return '/news'

  const localePrefixes = Object.values(SITE_LOCALE_PREFIX_MAP)
  const [firstSegment, ...rest] = path.split('/').filter(Boolean)

  if (!firstSegment || !localePrefixes.includes(firstSegment)) return null

  return `/${rest.join('/')}` === newsArchivePath(1) ? `/${firstSegment}/news` : null
}

/**
 * 请求路径规范化的唯一来源：返回应当 301 过去的 canonical path，已规范则返回 null。
 *
 * 按优先级串联四条规则（与 app/middleware/locale.global.ts 的决策树同序）：
 *   1. 去尾斜杠：/about/ → /about
 *   2. 去默认语言前缀：/zh/pricing → /pricing
 *   3. 产品 URL 语言中性：/en/workspace → /workspace
 *   4. 新闻归档首页折回：/news/page/1 → /news
 *
 * 逐条化简而不是「命中即返回」，是为了让 /en/workspace/ 这类叠加情形一次收敛到 /workspace，
 * 避免连跳两次 301。
 */
export const canonicalRequestPath = (path: string): string | null => {
  const normalizedInput = path.startsWith('/') ? path : `/${path}`
  let current = hasTrailingSlash(normalizedInput)
    ? withoutTrailingSlash(normalizedInput)
    : normalizedInput

  const segments = current.split('/').filter(Boolean)
  const defaultPrefix = SITE_LOCALE_PREFIX_MAP[DEFAULT_LOCALE]

  // 默认语言（zh-CN）URL 不带前缀
  if (segments[0] === defaultPrefix) {
    const rest = segments.slice(1)
    current = rest.length ? `/${rest.join('/')}` : '/'
  }

  current = localizedProductPathToCanonical(current) ?? current
  current = newsArchiveFirstPageToCanonical(current) ?? current

  return current === normalizedInput ? null : current
}

export const localizedPath = (path: string, locale: SupportedLocale) => {
  const normalizedPath = path === '/' ? '' : path

  if (isProductPath(path)) {
    return path
  }

  if (locale === DEFAULT_LOCALE) {
    return normalizedPath || '/'
  }

  return `/${SITE_LOCALE_PREFIX_MAP[locale]}${normalizedPath}`
}

export const publicLocalizedPaths = (locales: readonly SupportedLocale[] = SUPPORTED_LOCALES) =>
  locales.flatMap((locale) => PUBLIC_PAGE_PATHS.map((path) => localizedPath(path, locale)))

/** 构建时生成静态 HTML 的营销页；其余语言公开页走默认 SSR */
export const PRERENDER_BASE_PATHS = ['/', '/about', '/help'] as const
/** 只为主要市场预渲染，避免 15 个语言 × N 页把构建时间放大 */
export const PRERENDER_LOCALES = ['zh-CN', 'en-US'] as const satisfies readonly SupportedLocale[]

export const prerenderRoutes = PRERENDER_LOCALES.flatMap((locale) =>
  PRERENDER_BASE_PATHS.map((path) => localizedPath(path, locale))
)

/** 走 SWR 的公开内容区根路径；新闻等内容走 API、更新频率低，适合缓存 SSR 结果 */
export const SWR_BASE_PATHS = ['/news'] as const

/**
 * 每条 SWR 根路径展开为「路径本身 + 子树」两条规则。
 *
 * 必须两条都写：Nitro 会为每条 swr 规则单独注册一个被 cachedEventHandler 包裹的
 * renderer handler，请求经 h3 router 派发；而 h3 router 里 '/news/**' 不匹配裸路径
 * '/news'，只写子树会让列表页静默落到未缓存的 '/**' handler。
 * 注意这与 routeRules 自身的 matcher 语义不同 —— 后者能匹配裸路径，
 * 所以 csrRouteRules 的 '/workspace/**' 对 '/workspace' 仍然生效。
 * 见 tests/unit/seo-routes.test.ts 的 SWR 规则断言。
 */
export const swrRouteRules = SUPPORTED_LOCALES.flatMap((locale) =>
  SWR_BASE_PATHS.flatMap((path) => {
    const localized = localizedPath(path, locale)
    return [localized, `${localized}/**`]
  })
)
