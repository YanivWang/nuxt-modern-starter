import {
  DEFAULT_LOCALE,
  PUBLIC_PAGE_PATHS,
  SITE_LOCALE_PREFIX_MAP,
  type SupportedLocale
} from './site'

export type PublicPagePath = (typeof PUBLIC_PAGE_PATHS)[number]

export const localizedPath = (path: string, locale: SupportedLocale) => {
  const normalizedPath = path === '/' ? '' : path

  if (locale === DEFAULT_LOCALE) {
    return normalizedPath || '/'
  }

  return `/${SITE_LOCALE_PREFIX_MAP[locale]}${normalizedPath}`
}

export const publicLocalizedPaths = (locales: readonly SupportedLocale[] = ['zh-CN', 'en-US']) =>
  locales.flatMap((locale) => PUBLIC_PAGE_PATHS.map((path) => localizedPath(path, locale)))

export const productRoutePatterns = ['/app/**'] as const

export const productLocalizedPathPatterns = (
  locales: readonly SupportedLocale[] = ['zh-CN', 'en-US']
) => locales.flatMap((locale) => productRoutePatterns.map((path) => localizedPath(path, locale)))

export const prerenderRoutes = publicLocalizedPaths().filter(
  (path) =>
    path === '/' ||
    path === '/pricing' ||
    path === '/help' ||
    path === '/en' ||
    path === '/en/pricing' ||
    path === '/en/help'
)

export const swrRouteRules = ['/news/**', '/en/news/**'] as const

export const csrRouteRules = productLocalizedPathPatterns()
