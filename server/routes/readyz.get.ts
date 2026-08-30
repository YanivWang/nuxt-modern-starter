/*
  【文件职责】
    Nitro 路由 handler：GET /readyz，就绪探针 —— 校验运行期配置是否完整可服务。

  【架构位置】
    server 层 — 运维基础设施；编排系统 readiness probe 使用，决定是否把流量切进来。

  【主要导出 / 路由】
    GET /readyz；就绪返回 200，未就绪返回 503 并列出缺失项

  【依赖关系】
    - 依赖：runtimeConfig.public.apiBase / siteUrl
    - 被引用：部署文档、编排系统 readiness probe

  【渲染 / 数据】
    只做本地配置检查，不发出站请求 —— 就绪探针里打后端会让后端抖动放大成本服务的滚动重启。

  【边界与注意】
    与 /healthz 分工：进程活着但配置缺失时，healthz 200 而 readyz 503，
    编排系统据此把实例摘出负载均衡而不是反复重启它。
*/
import { defineEventHandler, setHeader, setResponseStatus } from 'h3'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler((event) => {
  setHeader(event, 'cache-control', 'no-store')

  const config = useRuntimeConfig(event)
  // 缺失项一起返回，避免运维改一个变量、重启、再发现还差一个
  const missing: string[] = []

  if (!config.public.apiBase) {
    missing.push('NUXT_PUBLIC_API_BASE')
  }

  if (!config.public.siteUrl) {
    missing.push('NUXT_PUBLIC_SITE_URL')
  }

  if (missing.length > 0) {
    setResponseStatus(event, 503)

    return { status: 'unready', missing }
  }

  return { status: 'ready', missing: [] }
})
