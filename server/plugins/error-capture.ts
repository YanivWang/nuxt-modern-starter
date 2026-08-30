/*
  【文件职责】
    Nitro 插件：挂 error 钩子，把所有未处理的服务端错误写成结构化日志（含 requestId 与请求上下文）。
    这是服务端错误的唯一收口 —— 在此之前，SSR 500 只会以框架默认格式打到 stdout，无法关联、无法采集。

  【架构位置】
    server 层 — server/plugins，Nitro 启动时注册一次。

  【主要导出 / 路由】
    default export（defineNitroPlugin）

  【依赖关系】
    - 依赖：server/utils/logger.ts、config/observability.ts
    - 被引用：Nitro 自动注册 server/plugins/*

  【渲染 / 数据】
    进程级；每次请求出错时触发。

  【边界与注意】
    这里只负责「记录」，不改变响应 —— 错误页渲染仍由 app/error.vue 负责。
    要接 Sentry / Datadog 时，在此处追加一次 transport 调用即可，业务代码无需改动。
*/
import { defineNitroPlugin } from '#imports'
import { getRequestURL } from 'h3'
import { logger, serializeError } from '../utils/logger'

export default defineNitroPlugin((nitroApp) => {
  // Nitro 的 error 钩子对 SSR 渲染错误与 server 路由错误都会触发
  nitroApp.hooks.hook('error', (error, context) => {
    // 静态资源等非请求路径的错误没有 event，字段按 undefined 落库即可
    const event = context?.event

    logger.error('unhandled server error', {
      requestId: event?.context?.requestId,
      method: event?.method,
      path: event ? getRequestURL(event).pathname : undefined,
      statusCode: (error as { statusCode?: number })?.statusCode,
      err: serializeError(error)
    })
  })
})
