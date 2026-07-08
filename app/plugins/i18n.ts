/*
  【文件职责】
    vue-i18n 插件（universal）：为当前 Nuxt app 创建独立 i18n 实例，首屏按 URL/cookie 解析 locale。
    与 app/middleware/locale.global.ts 配合，middleware 负责导航切换时的 reload。

  【架构位置】
    共享层 — app/plugins，universal。

  【主要导出 / 路由】
    default export（defineNuxtPlugin）

  【依赖关系】
    - 依赖：i18n/index.ts（createAppI18n、resolvePreferredLocale）
    - 被引用：Nuxt 自动注册；全站 useI18n / t()

  【渲染 / 数据】
    universal — SSR 首请求优先读 URL/cookie；CSR 水合同步。

  【边界与注意】
    产品页无 language 路由参数时，优先读取持久化语言 cookie。
*/
import { createAppI18n, resolvePreferredLocale, STORAGE_KEY_LANGUAGE } from '../../i18n'

export default defineNuxtPlugin(async (nuxtApp) => {
  const route = useRoute()
  const languageCookie = useCookie<string | undefined>(STORAGE_KEY_LANGUAGE)
  const locale = resolvePreferredLocale(route.path, languageCookie.value)
  const i18nContext = createAppI18n()

  await i18nContext.loadLocaleMessages(locale)
  nuxtApp.vueApp.use(i18nContext.i18n)

  return {
    provide: {
      i18nContext
    }
  }
})
