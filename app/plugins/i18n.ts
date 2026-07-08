/*
  【文件职责】
    vue-i18n 插件（universal）：首屏按路由 language 参数加载 locale 文案并注册 i18n 实例。
    与 app/middleware/locale.global.ts 配合，middleware 负责导航切换时的 reload。

  【架构位置】
    共享层 — app/plugins，universal。

  【主要导出 / 路由】
    default export（defineNuxtPlugin）

  【依赖关系】
    - 依赖：i18n/index.ts（i18n、loadLocaleMessages、matchRouteLanguage）
    - 被引用：Nuxt 自动注册；全站 useI18n / t()

  【渲染 / 数据】
    universal — SSR 首请求加载默认或 /en 文案；CSR 水合同步。

  【边界与注意】
    产品页无 language 路由参数时 matchRouteLanguage 回退 DEFAULT_LOCALE。
*/
import { i18n, loadLocaleMessages, matchRouteLanguage } from '../../i18n'

export default defineNuxtPlugin(async (nuxtApp) => {
  const route = useRoute()
  // [[language]] 动态段的 path 前缀（如 en）；产品页无此参数时 matchRouteLanguage 回退 DEFAULT_LOCALE
  const locale = matchRouteLanguage(route.params.language as string | undefined)

  // localeFromPrefix 对不支持前缀返回 undefined，兜底 zh-CN 保证首屏有可加载文案
  await loadLocaleMessages(locale || 'zh-CN')
  nuxtApp.vueApp.use(i18n)
})
