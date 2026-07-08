/*
  【文件职责】
    vue-i18n 实例与语言路由 helper 单一入口：按需加载 locale 文案、URL 前缀解析、语言切换 URL 生成。
    getSwitchLanguageUrl 对产品 path 保持 URL 不变，仅切换 UI locale。

  【架构位置】
    i18n 层 — 被 app/middleware/locale.global.ts、language store、useLocalePath、plugins/i18n.ts 消费。

  【主要导出 / 路由】
    i18n、loadLocaleMessages、localeFromPrefix、resolvePreferredLocale、getSwitchLanguageUrl、
    relativeLangPath、t、STORAGE_KEY_LANGUAGE、LOCALE_LANGUAGE_MODULES

  【依赖关系】
    - 依赖：config/site.ts、config/routes.ts（isProductPath）、i18n/zh-CN、i18n/en-US 及各 locale 包
    - 被引用：locale.global middleware、language store、useLocalePath、LanguageSwitcher

  【渲染 / 数据】
    默认 locale（zh-CN）同步加载；其余 locale 异步 import；cookie 持久化产品区语言。

  【边界与注意】
    不使用 @nuxtjs/i18n 模块；公开页 URL 带语言前缀，产品页语言切换不改变 path。
    新增语言需同步 config/site.ts、LOCALE_MESSAGE_RESOLVERS、i18n/<locale>/modules 与 locale 相关单测。
*/
import { createI18n } from 'vue-i18n'
import type { Ref } from 'vue'
import zhCN from './zh-CN'
import {
  DEFAULT_LOCALE,
  SITE_LOCALE_OPTIONS,
  SITE_LOCALE_PREFIX_MAP,
  SUPPORTED_LOCALES,
  type SupportedLocale
} from '../config/site'
import { isProductPath } from '../config/routes'

export const STORAGE_KEY_LANGUAGE = 'nuxt-modern-starter-language'
export const LANGUAGE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365
type LocaleMessages = typeof zhCN

export type LocaleLangType = SupportedLocale

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

type LocaleLanguageModule = (typeof SITE_LOCALE_OPTIONS)[SupportedLocale] & {
  pathPrefix: string
  resolve: () => Promise<LocaleMessages>
}

export const LOCALE_LANGUAGE_MODULES = SUPPORTED_LOCALES.reduce(
  (modules, locale) => {
    modules[locale] = {
      ...SITE_LOCALE_OPTIONS[locale],
      pathPrefix: SITE_LOCALE_PREFIX_MAP[locale],
      resolve: LOCALE_MESSAGE_RESOLVERS[locale]
    }

    return modules
  },
  {} as Record<SupportedLocale, LocaleLanguageModule>
)

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
