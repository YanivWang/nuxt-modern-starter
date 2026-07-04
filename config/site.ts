export const SITE_NAME = 'Nuxt Modern Starter'

export const SITE_DESCRIPTION =
  'A reusable Nuxt 4 starter for marketing sites, SEO pages, and lightweight SaaS frontends.'

export const DEFAULT_SITE_URL = 'https://example.com'

export const DEFAULT_LOCALE = 'zh-CN'

export const SUPPORTED_LOCALES = ['zh-CN', 'en-US'] as const

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

export const SITE_LOCALE_PREFIX_MAP: Record<SupportedLocale, string> = {
  'zh-CN': 'zh',
  'en-US': 'en'
}

export const PUBLIC_PAGE_PATHS = ['/', '/pricing', '/help', '/news'] as const

export const NAV_ITEMS = [
  { labelKey: 'nav.home', path: '/' },
  { labelKey: 'nav.pricing', path: '/pricing' },
  { labelKey: 'nav.help', path: '/help' },
  { labelKey: 'nav.news', path: '/news' }
] as const

export const DEFAULT_SEO = {
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  ogImage: '/og-default.png'
} as const
