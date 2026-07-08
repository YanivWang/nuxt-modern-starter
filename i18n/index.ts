/*
  【文件职责】
    vue-i18n 实例与语言路由 helper 单一入口：按需加载 locale 文案、URL 前缀解析、语言切换 URL 生成。
    getSwitchLanguageUrl 对产品 path 保持 URL 不变，仅切换 UI locale。

  【架构位置】
    i18n 层 — 被 app/middleware/locale.global.ts、language store、useLocalePath、plugins/i18n.ts 消费。

  【主要导出 / 路由】
    i18n、loadLocaleMessages、localeFromPrefix、resolvePreferredLocale、getSwitchLanguageUrl、
    relativeLangPath、t、STORAGE_KEY_LANGUAGE、SITE_LANG_MAP

  【依赖关系】
    - 依赖：config/site.ts、config/routes.ts（isProductPath）、i18n/zh-CN、i18n/en-US 及各 locale 包
    - 被引用：locale.global middleware、language store、useLocalePath、LanguageSwitcher

  【渲染 / 数据】
    默认 locale（zh-CN）同步加载；其余 locale 异步 import；cookie 持久化产品区语言。

  【边界与注意】
    不使用 @nuxtjs/i18n 模块；公开页 URL 带语言前缀，产品页语言切换不改变 path。
    修改 LOCALE_LANGUAGE_MODULES 需同步 tests/unit/locale-routing.test.ts、tests/unit/locale-path.test.ts。
*/
import { createI18n } from 'vue-i18n'
import type { Ref } from 'vue'
import zhCN from './zh-CN'
import {
  DEFAULT_LOCALE,
  SITE_LOCALE_PREFIX_MAP,
  SUPPORTED_LOCALES,
  type SupportedLocale
} from '../config/site'
import { isProductPath } from '../config/routes'

export const STORAGE_KEY_LANGUAGE = 'nuxt-modern-starter-language'
export const LANGUAGE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365
type LocaleMessages = typeof zhCN

export type LocaleLangType = SupportedLocale

export const SITE_LANG_MAP = {
  'zh-CN': {
    id: 'zh',
    pathPrefix: 'zh',
    label: '简体中文'
  },
  'en-US': {
    id: 'en',
    pathPrefix: 'en',
    label: 'English'
  },
  'pt-PT': {
    id: 'pt',
    pathPrefix: 'pt',
    label: 'Português'
  },
  'es-ES': {
    id: 'es',
    pathPrefix: 'es',
    label: 'Español'
  },
  'ko-KR': {
    id: 'ko',
    pathPrefix: 'kr',
    label: '한국어'
  },
  'th-TH': {
    id: 'th',
    pathPrefix: 'th',
    label: 'ไทย'
  },
  'ms-MY': {
    id: 'ms',
    pathPrefix: 'my',
    label: 'Bahasa Melayu'
  },
  'id-ID': {
    id: 'id',
    pathPrefix: 'id',
    label: 'Bahasa Indonesia'
  },
  'ph-PH': {
    id: 'tl',
    pathPrefix: 'ph',
    label: 'Filipino'
  },
  'ja-JP': {
    id: 'ja',
    pathPrefix: 'jp',
    label: '日本語'
  },
  'de-DE': {
    id: 'de',
    pathPrefix: 'de',
    label: 'Deutsch'
  },
  'fr-FR': {
    id: 'fr',
    pathPrefix: 'fr',
    label: 'Français'
  },
  'ru-RU': {
    id: 'ru',
    pathPrefix: 'ru',
    label: 'Русский'
  },
  'zh-HK': {
    id: 'zh-HK',
    pathPrefix: 'zh-hk',
    label: '繁體中文（香港）'
  },
  'pt-BR': {
    id: 'pt-BR',
    pathPrefix: 'pt-br',
    label: 'Português (Brasil)'
  }
} as const satisfies Record<SupportedLocale, { id: string; pathPrefix: string; label: string }>

const LOCALE_MESSAGE_RESOLVERS = {
  'zh-CN': async () => zhCN,
  'en-US': () => import('./en-US/index').then((module) => module.default),
  'pt-PT': () => import('./pt-PT/index').then((module) => module.default),
  'es-ES': () => import('./es-ES/index').then((module) => module.default),
  'ko-KR': () => import('./ko-KR/index').then((module) => module.default),
  'th-TH': () => import('./th-TH/index').then((module) => module.default),
  'ms-MY': () => import('./ms-MY/index').then((module) => module.default),
  'id-ID': () => import('./id-ID/index').then((module) => module.default),
  'ph-PH': () => import('./ph-PH/index').then((module) => module.default),
  'ja-JP': () => import('./ja-JP/index').then((module) => module.default),
  'de-DE': () => import('./de-DE/index').then((module) => module.default),
  'fr-FR': () => import('./fr-FR/index').then((module) => module.default),
  'ru-RU': () => import('./ru-RU/index').then((module) => module.default),
  'zh-HK': () => import('./zh-HK/index').then((module) => module.default),
  'pt-BR': () => import('./pt-BR/index').then((module) => module.default)
} as const satisfies Record<SupportedLocale, () => Promise<LocaleMessages>>

export const LOCALE_LANGUAGE_MODULES = {
  'zh-CN': {
    ...SITE_LANG_MAP['zh-CN'],
    resolve: LOCALE_MESSAGE_RESOLVERS['zh-CN']
  },
  'en-US': {
    ...SITE_LANG_MAP['en-US'],
    resolve: LOCALE_MESSAGE_RESOLVERS['en-US']
  },
  'pt-PT': { ...SITE_LANG_MAP['pt-PT'], resolve: LOCALE_MESSAGE_RESOLVERS['pt-PT'] },
  'es-ES': { ...SITE_LANG_MAP['es-ES'], resolve: LOCALE_MESSAGE_RESOLVERS['es-ES'] },
  'ko-KR': { ...SITE_LANG_MAP['ko-KR'], resolve: LOCALE_MESSAGE_RESOLVERS['ko-KR'] },
  'th-TH': { ...SITE_LANG_MAP['th-TH'], resolve: LOCALE_MESSAGE_RESOLVERS['th-TH'] },
  'ms-MY': { ...SITE_LANG_MAP['ms-MY'], resolve: LOCALE_MESSAGE_RESOLVERS['ms-MY'] },
  'id-ID': { ...SITE_LANG_MAP['id-ID'], resolve: LOCALE_MESSAGE_RESOLVERS['id-ID'] },
  'ph-PH': { ...SITE_LANG_MAP['ph-PH'], resolve: LOCALE_MESSAGE_RESOLVERS['ph-PH'] },
  'ja-JP': { ...SITE_LANG_MAP['ja-JP'], resolve: LOCALE_MESSAGE_RESOLVERS['ja-JP'] },
  'de-DE': { ...SITE_LANG_MAP['de-DE'], resolve: LOCALE_MESSAGE_RESOLVERS['de-DE'] },
  'fr-FR': { ...SITE_LANG_MAP['fr-FR'], resolve: LOCALE_MESSAGE_RESOLVERS['fr-FR'] },
  'ru-RU': { ...SITE_LANG_MAP['ru-RU'], resolve: LOCALE_MESSAGE_RESOLVERS['ru-RU'] },
  'zh-HK': { ...SITE_LANG_MAP['zh-HK'], resolve: LOCALE_MESSAGE_RESOLVERS['zh-HK'] },
  'pt-BR': { ...SITE_LANG_MAP['pt-BR'], resolve: LOCALE_MESSAGE_RESOLVERS['pt-BR'] }
} as const

export const i18n = createI18n({
  legacy: false,
  locale: DEFAULT_LOCALE,
  fallbackLocale: DEFAULT_LOCALE,
  messages: {
    [DEFAULT_LOCALE]: zhCN
  }
})

const loadedLocales = new Set<SupportedLocale>([DEFAULT_LOCALE])

export const isSupportedLocale = (locale: string): locale is SupportedLocale =>
  SUPPORTED_LOCALES.includes(locale as SupportedLocale)

export const localeFromPrefix = (prefix?: string) =>
  SUPPORTED_LOCALES.find((locale) => SITE_LOCALE_PREFIX_MAP[locale] === prefix)

export const resolveStoredLocale = (locale?: string | null) =>
  locale && isSupportedLocale(locale) ? locale : undefined

export const extractLanguagePrefixByPath = (path: string) => {
  const normalizedPath =
    path.startsWith('http://') || path.startsWith('https://') ? new URL(path).pathname : path
  const segment = normalizedPath.match(/^\/([a-z-]{2,5})(?=\/|$)/i)?.[1]

  return segment && localeFromPrefix(segment) ? segment : ''
}

export const relativeLangPath = (path: string) => {
  const segments = path.split('/').filter(Boolean)
  const firstSegmentLocale = localeFromPrefix(segments[0])

  if (firstSegmentLocale) {
    segments.shift()
  }

  return `/${segments.join('/')}`.replace(/\/$/, '') || '/'
}

export const resolvePreferredLocale = (path: string, persistedLocale?: string | null) => {
  const prefix = extractLanguagePrefixByPath(path)
  const prefixedLocale = localeFromPrefix(prefix)

  if (prefixedLocale) {
    return prefixedLocale
  }

  const storedLocale = resolveStoredLocale(persistedLocale)
  const relativePath = relativeLangPath(path)

  if (storedLocale && isProductPath(relativePath)) {
    return storedLocale
  }

  return DEFAULT_LOCALE
}

export const getSwitchLanguageUrl = (
  fullPath: string,
  targetLocale: SupportedLocale,
  queryAndHash = ''
) => {
  const normalizedFullPath = (() => {
    if (fullPath.startsWith('http://') || fullPath.startsWith('https://')) {
      const url = new URL(fullPath)
      return `${url.pathname}${url.search}${url.hash}`
    }

    return fullPath
  })()
  const pathMatch = normalizedFullPath.match(/^[^?#]+/)
  const pathOnly = pathMatch?.[0] || '/'
  const searchAndHash = normalizedFullPath.slice(pathOnly.length)
  const relativePath = relativeLangPath(pathOnly)
  const suffix = queryAndHash || searchAndHash

  // 产品 URL 语言中性：切换 UI 语言时不改 path
  if (isProductPath(relativePath)) {
    return `${relativePath}${suffix}`
  }

  const targetPrefix = SITE_LOCALE_PREFIX_MAP[targetLocale]
  const path =
    targetLocale === DEFAULT_LOCALE
      ? relativePath
      : `/${targetPrefix}${relativePath === '/' ? '' : relativePath}`

  return `${path}${suffix}`
}

export const loadLocaleMessages = async (locale: SupportedLocale) => {
  if (!loadedLocales.has(locale)) {
    const messages = await LOCALE_LANGUAGE_MODULES[locale].resolve()
    i18n.global.setLocaleMessage(locale, messages)
    loadedLocales.add(locale)
  }

  const currentLocale = i18n.global.locale as unknown as Ref<SupportedLocale>
  currentLocale.value = locale
}

export const t = i18n.global.t
