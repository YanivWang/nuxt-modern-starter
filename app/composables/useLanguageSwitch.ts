/*
  【文件职责】
    语言切换 composable：更新 languageStore 并 router.push 到 switchLocalePath 目标。
    公开页切换会改 URL；产品区 switchLocalePath 保持 path 不变仅换 UI locale。

  【架构位置】
    共享层 — app/composables，被 LanguageSwitcher、UserAccountMenu 消费。

  【主要导出 / 路由】
    useLanguageSwitch — switchLanguage、languages、currentLanguage

  【依赖关系】
    - 依赖：config/site.ts、useLanguageStore、useLocalePath
    - 被引用：LanguageSwitcher、product-shell 用户菜单

  【渲染 / 数据】
    client 交互；chooseLanguage 加载 i18n messages 后导航。

  【边界与注意】
    相同 locale 或不在 SUPPORTED_LOCALES 时 no-op。
*/
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
