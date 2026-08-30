/*
  【文件职责】
    客户端错误捕获插件（client-only）：接管 Vue 渲染错误、window.onerror 与未处理的 Promise rejection，
    去重后 POST 到第一方 telemetry 端点。

  【架构位置】
    共享层 — app/plugins，.client 后缀仅客户端执行。

  【主要导出 / 路由】
    default export（defineNuxtPlugin）→ POST /api/telemetry/errors

  【依赖关系】
    - 依赖：app/utils/error-report.ts、config/observability.ts、
      runtimeConfig.public.errorReportingEnabled
    - 被引用：Nuxt 自动注册

  【渲染 / 数据】
    client-only；上报用 keepalive fetch，保证页面正在卸载时也能发出去。

  【边界与注意】
    上报失败必须静默吞掉：在错误处理器里再抛错会形成上报风暴。
    换 Sentry / Datadog 时只需替换本文件的 send 实现，捕获与去重逻辑不用动。
*/
import { CLIENT_ERROR_ENDPOINT } from '../../config/observability'
import { buildClientErrorReport, createErrorReportDeduper } from '../utils/error-report'
import type { ClientErrorKind } from '../utils/error-report'

export default defineNuxtPlugin((nuxtApp) => {
  const runtimeConfig = useRuntimeConfig()

  if (runtimeConfig.public.errorReportingEnabled !== true) {
    return
  }

  const deduper = createErrorReportDeduper()

  const send = (kind: ClientErrorKind, error: unknown) => {
    const report = buildClientErrorReport(kind, error, window.location.pathname)

    if (!deduper.shouldReport(report.fingerprint)) {
      return
    }

    // keepalive：页面卸载途中触发的错误仍能送达
    void fetch(CLIENT_ERROR_ENDPOINT, {
      method: 'POST',
      keepalive: true,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(report)
      // 上报链路自身的失败必须静默，否则会递归触发 unhandledrejection
    }).catch(() => {})
  }

  nuxtApp.hook('vue:error', (error) => send('vue', error))

  window.addEventListener('error', (event) => send('window', event.error ?? event.message))
  window.addEventListener('unhandledrejection', (event) => send('unhandledrejection', event.reason))
})
