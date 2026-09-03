/*
  【文件职责】
    站点级常量单一来源：品牌名、默认 locale、支持语言、公开页路径、导航与默认 SEO。
    PUBLIC_PAGE_PATHS 决定 sitemap / hreflang 的公开页集合；不含 /sign-in、/sign-up（noindex 鉴权页）。
    NAV_ITEMS 供 AppHeader 渲染主导航；DEFAULT_SEO、SITE_ORG 供 usePageSeo 与 Organization JSON-LD。

  【架构位置】
    config 层 — 全站 i18n、SEO、公开导航的底层配置，无运行时副作用。

  【主要导出 / 路由】
    SITE_NAME、SITE_DESCRIPTION、DEFAULT_SITE_URL、DEFAULT_LOCALE、SUPPORTED_LOCALES、
    SITE_LOCALE_PREFIX_MAP、SITE_HREFLANG_MAP、SITE_INTL_LOCALE_MAP、SITE_CONTENT_LOCALE_MAP、
    SITE_LOCALE_OPTIONS、PUBLIC_PAGE_PATHS、NAV_ITEMS、
    DEFAULT_SEO、SITE_ORG、SupportedLocale

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
  'A general-purpose Nuxt 4 SaaS frontend foundation with public pages, SEO, i18n, auth, workspace, projects, editor workflow, requests, theming, and deployment samples.'

export const DEFAULT_SITE_URL = 'https://example.com'

export const DEFAULT_LOCALE = 'zh-CN'

export const SUPPORTED_LOCALES = [
  'zh-CN',
  'en-US',
  'pt-PT',
  'es-ES',
  'ko-KR',
  'th-TH',
  'ms-MY',
  'id-ID',
  'ph-PH',
  'ja-JP',
  'de-DE',
  'fr-FR',
  'ru-RU',
  'zh-HK',
  'pt-BR'
] as const

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

/** URL 路径前缀；默认语言 zh-CN 无前缀，部分语言使用市场路径（如 ko → /kr） */
export const SITE_LOCALE_PREFIX_MAP: Record<SupportedLocale, string> = {
  'zh-CN': 'zh',
  'en-US': 'en',
  'pt-PT': 'pt',
  'es-ES': 'es',
  'ko-KR': 'kr',
  'th-TH': 'th',
  'ms-MY': 'my',
  'id-ID': 'id',
  'ph-PH': 'ph',
  'ja-JP': 'jp',
  'de-DE': 'de',
  'fr-FR': 'fr',
  'ru-RU': 'ru',
  'zh-HK': 'zh-hk',
  'pt-BR': 'pt-br'
}

/** hreflang 属性值；单语言市场用语言码，区域变体保留完整码（对齐主流国际化站点） */
export const SITE_HREFLANG_MAP: Record<SupportedLocale, string> = {
  'zh-CN': 'zh',
  'en-US': 'en',
  'pt-PT': 'pt',
  'es-ES': 'es',
  'ko-KR': 'ko',
  'th-TH': 'th',
  'ms-MY': 'ms',
  'id-ID': 'id',
  'ph-PH': 'tl',
  'ja-JP': 'ja',
  'de-DE': 'de',
  'fr-FR': 'fr',
  'ru-RU': 'ru',
  'zh-HK': 'zh-HK',
  'pt-BR': 'pt-BR'
}

/**
 * 站点 locale → 后端**内容**语言。
 *
 * 站点支持 15 个语言，但 nuxt-modern-starter-api 的新闻与定价只有 zh-CN / en-US 两种
 * （见契约里 /content/* 的 locale 枚举）。不做映射时，后端按「accept-language 以 en 开头」
 * 判断，其余一律落到 zh-CN —— 于是 /fr/news、/ko/pricing 这些页面外壳是本地语言、
 * 正文却是中文，而站点还在 hreflang 里声明它们是法语版、韩语版。
 *
 * 这里显式选择回退目标，与站点自己的既有约定一致：config/content/faq.ts 的
 * resolveLocalizedContent 缺翻译时就是 en-US → zh-CN。中文圈落 zh-CN，其余落 en-US——
 * 对法语、韩语、葡语读者来说英文正文远比中文正文可读。
 *
 * 逐条列全而不是「只写例外」：新增语言时必须显式决定它的内容语言。
 * 取值范围由 tests/unit/api-contract.test.ts 对着契约里的 locale 枚举核对。
 */
export const SITE_CONTENT_LOCALE_MAP: Record<SupportedLocale, 'zh-CN' | 'en-US'> = {
  'zh-CN': 'zh-CN',
  'zh-HK': 'zh-CN',
  'en-US': 'en-US',
  'pt-PT': 'en-US',
  'pt-BR': 'en-US',
  'es-ES': 'en-US',
  'ko-KR': 'en-US',
  'th-TH': 'en-US',
  'ms-MY': 'en-US',
  'id-ID': 'en-US',
  'ph-PH': 'en-US',
  'ja-JP': 'en-US',
  'de-DE': 'en-US',
  'fr-FR': 'en-US',
  'ru-RU': 'en-US'
}

/**
 * 传给 Intl.* 的 BCP 47 标签。
 *
 * SUPPORTED_LOCALES 的键是站点内部标识，不保证是合法语言标签：'ph' 不是 ISO 639
 * 语言码（菲律宾语是 fil / tl），Intl 认不出来又不会报错，只会静默回退到默认语言 ——
 * 表现为菲律宾语下的新闻发布日期和工作台时间戳全是英文格式，没有任何报错。
 * 其余语言的标签与内部标识一致，这里逐条列全而不是「只写例外」，
 * 是为了让新增语言时必须显式给出它的 Intl 标签。
 * 由 tests/unit/format-date.test.ts 断言每一条都不会被 Intl 回退。
 */
export const SITE_INTL_LOCALE_MAP: Record<SupportedLocale, string> = {
  'zh-CN': 'zh-CN',
  'en-US': 'en-US',
  'pt-PT': 'pt-PT',
  'es-ES': 'es-ES',
  'ko-KR': 'ko-KR',
  'th-TH': 'th-TH',
  'ms-MY': 'ms-MY',
  'id-ID': 'id-ID',
  'ph-PH': 'fil-PH',
  'ja-JP': 'ja-JP',
  'de-DE': 'de-DE',
  'fr-FR': 'fr-FR',
  'ru-RU': 'ru-RU',
  'zh-HK': 'zh-HK',
  'pt-BR': 'pt-BR'
}

/** 语言选择器与后端语言 id 元数据；URL 前缀只来自 SITE_LOCALE_PREFIX_MAP */
export const SITE_LOCALE_OPTIONS: Record<SupportedLocale, { id: string; label: string }> = {
  'zh-CN': {
    id: 'zh',
    label: '简体中文'
  },
  'en-US': {
    id: 'en',
    label: 'English'
  },
  'pt-PT': {
    id: 'pt',
    label: 'Português'
  },
  'es-ES': {
    id: 'es',
    label: 'Español'
  },
  'ko-KR': {
    id: 'ko',
    label: '한국어'
  },
  'th-TH': {
    id: 'th',
    label: 'ไทย'
  },
  'ms-MY': {
    id: 'ms',
    label: 'Bahasa Melayu'
  },
  'id-ID': {
    id: 'id',
    label: 'Bahasa Indonesia'
  },
  'ph-PH': {
    id: 'tl',
    label: 'Filipino'
  },
  'ja-JP': {
    id: 'ja',
    label: '日本語'
  },
  'de-DE': {
    id: 'de',
    label: 'Deutsch'
  },
  'fr-FR': {
    id: 'fr',
    label: 'Français'
  },
  'ru-RU': {
    id: 'ru',
    label: 'Русский'
  },
  'zh-HK': {
    id: 'zh-HK',
    label: '繁體中文（香港）'
  },
  'pt-BR': {
    id: 'pt-BR',
    label: 'Português (Brasil)'
  }
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
