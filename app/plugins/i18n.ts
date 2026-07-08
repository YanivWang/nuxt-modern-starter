/*
  【文件职责】
    vue-i18n 插件（universal）：首屏按 URL/cookie 解析 locale，加载文案并注册 i18n 实例。
    与 app/middleware/locale.global.ts 配合，middleware 负责导航切换时的 reload。

  【架构位置】
    共享层 — app/plugins，universal。

  【主要导出 / 路由】
    default export（defineNuxtPlugin）

  【依赖关系】
    - 依赖：i18n/index.ts（i18n、loadLocaleMessages、resolvePreferredLocale）
    - 被引用：Nuxt 自动注册；全站 useI18n / t()

  【渲染 / 数据】
    universal — SSR 首请求优先读 URL/cookie；CSR 水合同步。

  【边界与注意】
    产品页无 language 路由参数时，优先读取持久化语言 cookie。
*/
import { i18n, loadLocaleMessages, resolvePreferredLocale, STORAGE_KEY_LANGUAGE } from '../../i18n'

export default defineNuxtPlugin(async (nuxtApp) => {
  const route = useRoute()
  const languageCookie = useCookie<string | undefined>(STORAGE_KEY_LANGUAGE)
  const locale = resolvePreferredLocale(route.path, languageCookie.value)

  await loadLocaleMessages(locale)
  nuxtApp.vueApp.use(i18n)
})
