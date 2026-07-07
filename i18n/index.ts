/*
  【文件职责】
    vue-i18n 实例与语言路由 helper 单一入口：按需加载 locale 文案、URL 前缀解析、语言切换 URL 生成。
    getSwitchLanguageUrl 对产品 path 保持 URL 不变，仅切换 UI locale。

  【架构位置】
    i18n 层 — 被 app/middleware/locale.global.ts、language store、useLocalePath、plugins/i18n.ts 消费。

  【主要导出 / 路由】
    i18n、loadLocaleMessages、localeFromPrefix、matchRouteLanguage、getSwitchLanguageUrl、
    relativeLangPath、t、STORAGE_KEY_LANGUAGE、SITE_LANG_MAP

  【依赖关系】
    - 依赖：config/site.ts、config/routes.ts（isProductPath）、i18n/zh-CN、i18n/en-US
    - 被引用：locale.global middleware、language store、useLocalePath、LanguageSwitcher

  【渲染 / 数据】
    默认 locale（zh-CN）同步加载；en-US 异步 import；middleware 导航时调用 loadLocaleMessages。

  【边界与注意】
    不使用 @nuxtjs/i18n 模块；公开页 URL 带 /en 前缀，产品页语言切换不改变 path。
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
  }
} as const satisfies Record<SupportedLocale, { id: string; pathPrefix: string; label: string }>

export const LOCALE_LANGUAGE_MODULES = {
  'zh-CN': {
    ...SITE_LANG_MAP['zh-CN'],
    resolve: async () => zhCN
  },
  'en-US': {
    ...SITE_LANG_MAP['en-US'],
    resolve: () => import('./en-US').then((module) => module.default)
  }
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

export const matchRouteLanguage = (prefix?: string) => {
  if (!prefix) {
    return DEFAULT_LOCALE
  }

  return localeFromPrefix(prefix)
}

export const relativeLangPath = (path: string) => {
  const segments = path.split('/').filter(Boolean)
  const firstSegmentLocale = localeFromPrefix(segments[0])

  if (firstSegmentLocale) {
    segments.shift()
  }

  return `/${segments.join('/')}`.replace(/\/$/, '') || '/'
}

export const getSwitchLanguageUrl = (
  fullPath: string,
  targetLocale: SupportedLocale,
  queryAndHash = ''
) => {
  const relativePath = relativeLangPath(fullPath)

  // 产品 URL 语言中性：切换 UI 语言时不改 path
  if (isProductPath(relativePath)) {
    return `${relativePath}${queryAndHash}`
  }

  const targetPrefix = SITE_LOCALE_PREFIX_MAP[targetLocale]
  const path =
    targetLocale === DEFAULT_LOCALE
      ? relativePath
      : `/${targetPrefix}${relativePath === '/' ? '' : relativePath}`

  return `${path}${queryAndHash}`
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
