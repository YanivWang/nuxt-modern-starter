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

export const productPathPatterns = () => [...productRoutePatterns]

export const prerenderRoutes = publicLocalizedPaths().filter(
  (path) =>
    path === '/' ||
    path === '/about' ||
    path === '/help' ||
    path === '/en' ||
    path === '/en/about' ||
    path === '/en/help'
)

// 新闻、定价等动态内容走 API，更新频率较低，适合 SWR 缓存 SSR 结果。
export const swrRouteRules = ['/news/**', '/en/news/**', '/pricing', '/en/pricing'] as const
