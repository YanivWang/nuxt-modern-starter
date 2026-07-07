/*
  【文件职责】
    第三方统计脚本插件（client-only）：env 守卫下延迟加载 analyticsScriptSrc。
    默认关闭；启用时需同步 nuxt.config.ts CSP script-src 允许脚本来源。

  【架构位置】
    共享层 — app/plugins，universal 注册但 .client 后缀仅客户端执行。

  【主要导出 / 路由】
    default export（defineNuxtPlugin）

  【依赖关系】
    - 依赖：app/utils/load-script.ts、runtimeConfig.public.analytics*
    - 被引用：Nuxt 自动注册

  【渲染 / 数据】
    client-only；NUXT_PUBLIC_ANALYTICS_ENABLED === 'true' 且 scriptSrc 非空时加载。

  【边界与注意】
    启用 analytics 须在 nuxt.config.ts routeRules CSP 中放宽 script-src（及必要时 connect-src）。
*/
import { loadExternalScript } from '../utils/load-script'

export default defineNuxtPlugin(() => {
  const runtimeConfig = useRuntimeConfig()

  // 默认关闭；仅显式 env 开启时才加载第三方脚本
  if (runtimeConfig.public.analyticsEnabled !== true) {
    return
  }

  const scriptSrc = runtimeConfig.public.analyticsScriptSrc?.trim()
  if (!scriptSrc) {
    return
  }

  loadExternalScript(scriptSrc, runtimeConfig.public.analyticsDeferMs).catch((error) => {
    console.warn('[analytics] Failed to load script:', error)
  })
})
