/*
  【文件职责】
    UI 语言 Pinia store：currentLanguage 状态、chooseLanguage 加载 i18n 文案、cookie 持久化。
    产品区 UI 语言与 URL 解耦，由 languageStore 独立控制。

  【架构位置】
    共享层 — app/stores，被 locale.global middleware、useLanguageSwitch、useLocalePath 消费。

  【主要导出 / 路由】
    useLanguageStore — currentLanguage、currentLanguageId、languages、pathPrefix、
    chooseLanguage、toggleLanguage

  【依赖关系】
    - 依赖：config/site.ts、i18n/index.ts（cookie 常量与 locale 校验）
    - 被引用：app/middleware/locale.global.ts、LanguageSwitcher、UserAccountMenu

  【渲染 / 数据】
    SSR 与 CSR；chooseLanguage 触发 loadLocaleMessages；同一 cookie 供 SSR/CSR 读取。

  【边界与注意】
    产品 URL 语言中性；切换 UI 语言在产品区不改变 path（见 useLanguageSwitch / getSwitchLanguageUrl）。
*/
import {
  DEFAULT_LOCALE,
  SITE_LOCALE_OPTIONS,
  SITE_LOCALE_PREFIX_MAP,
  SUPPORTED_LOCALES,
  type SupportedLocale
} from '../../config/site'
import { LANGUAGE_COOKIE_MAX_AGE, resolveStoredLocale, STORAGE_KEY_LANGUAGE } from '../../i18n'

export const useLanguageStore = defineStore('language', () => {
  const languageCookie = useCookie<SupportedLocale | undefined>(STORAGE_KEY_LANGUAGE, {
    default: () => DEFAULT_LOCALE,
    maxAge: LANGUAGE_COOKIE_MAX_AGE,
    path: '/',
    sameSite: 'lax'
  })
  const currentLanguage = ref<SupportedLocale>(
    resolveStoredLocale(languageCookie.value) || DEFAULT_LOCALE
  )
  const currentLanguageId = computed(() => SITE_LOCALE_OPTIONS[currentLanguage.value].id)
  const languages = SUPPORTED_LOCALES.map((locale) => ({
    locale,
    ...SITE_LOCALE_OPTIONS[locale],
    pathPrefix: SITE_LOCALE_PREFIX_MAP[locale]
  }))

  const chooseLanguage = async (locale: SupportedLocale) => {
    const { $i18nContext } = useNuxtApp()

    currentLanguage.value = locale
    // cookie 持久化 UI 语言；产品区刷新 /workspace 等仍保持上次选择
    languageCookie.value = locale

    await $i18nContext.loadLocaleMessages(locale)
  }

  const toggleLanguage = async () => {
    const nextLocale = currentLanguage.value === DEFAULT_LOCALE ? 'en-US' : DEFAULT_LOCALE
    await chooseLanguage(nextLocale)
  }

  const pathPrefix = computed(() => SITE_LOCALE_PREFIX_MAP[currentLanguage.value])

  return {
    currentLanguage,
    currentLanguageId,
    languages,
    pathPrefix,
    chooseLanguage,
    toggleLanguage
  }
})
