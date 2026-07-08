/*
  【文件职责】
    路由分区与渲染策略单一来源：产品路径判定、多语言路径展开、prerender / SWR / CSR 规则列表。
    publicLocalizedPaths 从 PUBLIC_PAGE_PATHS 展开 zh-CN / en-US 变体，供 sitemap 与 hreflang 使用。

  【架构位置】
    config 层 — 被 nuxt.config.ts routeRules、locale middleware、useLocalePath、server SEO 工具消费。

  【主要导出 / 路由】
    productRoutePatterns、csrRouteRules、prerenderRoutes、swrRouteRules、
    isProductPath、localizedProductPathToCanonical、localizedPath、publicLocalizedPaths

  【依赖关系】
    - 依赖：config/site.ts（PUBLIC_PAGE_PATHS、SITE_LOCALE_PREFIX_MAP、DEFAULT_LOCALE）
    - 被引用：nuxt.config.ts、app/middleware/locale.global.ts、server/middleware/product-canonical.ts、
      useLocalePath、server/utils/seo.ts

  【渲染 / 数据】
    prerender：/、/about、/help 及 /en 变体；SWR：/news/** 及 /en 变体；/pricing 走默认 SSR；
    CSR（ssr: false）：/workspace/**、/docs/**、/account。

  【边界与注意】
    产品 URL 永不由 localizedPath 加语言前缀；localizedProductPathToCanonical 仅对产品 path 返回 canonical。
    修改 prerender / SWR / CSR 列表需同步 tests/unit/product-routes.test.ts、tests/unit/seo-routes.test.ts。
*/
import {
  DEFAULT_LOCALE,
  PUBLIC_PAGE_PATHS,
  SITE_LOCALE_PREFIX_MAP,
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

export const publicLocalizedPaths = (locales: readonly SupportedLocale[] = ['zh-CN', 'en-US']) =>
  locales.flatMap((locale) => PUBLIC_PAGE_PATHS.map((path) => localizedPath(path, locale)))

export const prerenderRoutes = publicLocalizedPaths().filter(
  (path) =>
    path === '/' ||
    path === '/about' ||
    path === '/help' ||
    path === '/en' ||
    path === '/en/about' ||
    path === '/en/help'
)

// 新闻等动态内容走 API，更新频率较低，适合 SWR 缓存 SSR 结果。
export const swrRouteRules = ['/news/**', '/en/news/**'] as const
