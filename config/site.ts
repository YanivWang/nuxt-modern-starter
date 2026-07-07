/*
  【文件职责】
    站点级常量单一来源：品牌名、默认 locale、支持语言、公开页路径、导航与默认 SEO。
    PUBLIC_PAGE_PATHS 决定 sitemap / hreflang 的公开页集合；不含 /sign-in、/sign-up（noindex 鉴权页）。
    NAV_ITEMS 供 AppHeader 渲染主导航；DEFAULT_SEO、SITE_ORG 供 usePageSeo 与 Organization JSON-LD。

  【架构位置】
    config 层 — 全站 i18n、SEO、公开导航的底层配置，无运行时副作用。

  【主要导出 / 路由】
    SITE_NAME、SITE_DESCRIPTION、DEFAULT_SITE_URL、DEFAULT_LOCALE、SUPPORTED_LOCALES、
    SITE_LOCALE_PREFIX_MAP、PUBLIC_PAGE_PATHS、NAV_ITEMS、DEFAULT_SEO、SITE_ORG、SupportedLocale

  【依赖关系】
    - 依赖：无（纯常量）
    - 被引用：config/routes.ts（PUBLIC_PAGE_PATHS 展开多语言路径）、i18n/index.ts、
      usePageSeo、AppHeader、server/utils/seo.ts、language store 等

  【渲染 / 数据】
    无 — 编译期 / 构建期常量；DEFAULT_SITE_URL 作 sitemap / robots 占位域名 fallback。

  【边界与注意】
    修改 SUPPORTED_LOCALES / SITE_LOCALE_PREFIX_MAP 需同步 i18n 文案、app/middleware/locale.global.ts
    与 tests/unit/locale-routing.test.ts、tests/unit/seo-routes.test.ts、tests/unit/page-seo.test.ts。
    新增公开 SEO 页须追加 PUBLIC_PAGE_PATHS 并更新 config/routes.ts 的 prerender / SWR 规则。
*/
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

export const PUBLIC_PAGE_PATHS = ['/', '/pricing', '/about', '/help', '/news'] as const

export const NAV_ITEMS = [
  { labelKey: 'nav.home', path: '/' },
  { labelKey: 'nav.pricing', path: '/pricing' },
  { labelKey: 'nav.about', path: '/about' },
  { labelKey: 'nav.help', path: '/help' },
  { labelKey: 'nav.news', path: '/news' }
] as const

export const DEFAULT_SEO = {
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  ogImage: '/og-default.png'
} as const

/** JSON-LD Organization：url 运行时 absoluteUrl(siteUrl, '/')；logo 运行时 absoluteUrl(siteUrl, logo 路径) */
export const SITE_ORG = {
  name: SITE_NAME,
  logo: '/og-default.png'
} as const
