import {
  DEFAULT_LOCALE,
  SITE_LOCALE_PREFIX_MAP,
  SUPPORTED_LOCALES,
  type SupportedLocale
} from '../../config/site'
import { loadLocaleMessages, SITE_LANG_MAP, STORAGE_KEY_LANGUAGE } from '../../i18n'

export const useLanguageStore = defineStore('language', () => {
  const currentLanguage = ref<SupportedLocale>(DEFAULT_LOCALE)
  const currentLanguageId = computed(() => SITE_LANG_MAP[currentLanguage.value].id)
  const languages = SUPPORTED_LOCALES.map((locale) => ({
    locale,
    ...SITE_LANG_MAP[locale]
  }))

  const chooseLanguage = async (locale: SupportedLocale) => {
    currentLanguage.value = locale

    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY_LANGUAGE, locale)
    }

    await loadLocaleMessages(locale)
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
