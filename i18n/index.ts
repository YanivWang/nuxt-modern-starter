import { createI18n } from 'vue-i18n'
import type { Ref } from 'vue'
import zhCN from './zh-CN'
import {
  DEFAULT_LOCALE,
  SITE_LOCALE_PREFIX_MAP,
  SUPPORTED_LOCALES,
  type SupportedLocale
} from '../config/site'

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

export const matcheRouteLanguage = matchRouteLanguage

export const exLanguagePrefixByPath = (path: string) => {
  const firstSegment = path.split('/').filter(Boolean)[0]
  return localeFromPrefix(firstSegment)
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
