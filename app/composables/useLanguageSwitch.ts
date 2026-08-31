/*
  【文件职责】
    语言切换 composable：更新 languageStore 并 router.push 到 switchLocalePath 目标。
    公开页切换会改 URL；产品区 switchLocalePath 保持 path 不变仅换 UI locale。

  【架构位置】
    共享层 — app/composables，被 LanguageSwitcher、UserAccountMenu 消费。

  【主要导出 / 路由】
    useLanguageSwitch — switchLanguage、languages、currentLanguage

  【依赖关系】
    - 依赖：config/site.ts、useLanguageStore、useLocalePath、app/utils/navigate-safely.ts
    - 被引用：LanguageSwitcher、product-shell 用户菜单

  【渲染 / 数据】
    client 交互；chooseLanguage 加载 i18n messages 后导航。

  【边界与注意】
    相同 locale 或不在 SUPPORTED_LOCALES 时 no-op。
    跳转走 pushSafely：switchLanguage 由 click handler fire-and-forget 调用，
    直接 await router.push 会让路由 guard 抛出的错误变成没人接的 unhandled rejection。
*/
import { SUPPORTED_LOCALES, type SupportedLocale } from '../../config/site'
import { pushSafely } from '../utils/navigate-safely'

export const useLanguageSwitch = () => {
  const router = useRouter()
  const languageStore = useLanguageStore()
  const { switchLocalePath } = useLocalePath()

  const switchLanguage = async (locale: SupportedLocale) => {
    // 非法 locale 或已是当前语言时直接返回，避免重复加载 i18n 与导航
    if (!SUPPORTED_LOCALES.includes(locale) || locale === languageStore.currentLanguage) {
      return
    }

    // 先更新 store 与 i18n 文案，再导航；公开页改 URL，产品区 path 不变（见 getSwitchLanguageUrl）
    await languageStore.chooseLanguage(locale)
    // 语言已经落到 store 与 cookie，跳转只是把 URL 对齐；它失败不该冒泡成 unhandled rejection
    await pushSafely(router, switchLocalePath(locale))
  }

  const languages = computed(() => languageStore.languages)
  const currentLanguage = computed(() => languageStore.currentLanguage)

  return {
    switchLanguage,
    languages,
    currentLanguage
  }
}
