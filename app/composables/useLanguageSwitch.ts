import { SUPPORTED_LOCALES, type SupportedLocale } from '../../config/site'

export const useLanguageSwitch = () => {
  const router = useRouter()
  const languageStore = useLanguageStore()
  const { switchLocalePath } = useLocalePath()

  const switchLanguage = async (locale: SupportedLocale) => {
    if (!SUPPORTED_LOCALES.includes(locale) || locale === languageStore.currentLanguage) {
      return
    }

    await languageStore.chooseLanguage(locale)
    await router.push(switchLocalePath(locale))
  }

  const languages = computed(() => languageStore.languages)
  const currentLanguage = computed(() => languageStore.currentLanguage)

  return {
    switchLanguage,
    languages,
    currentLanguage
  }
}
