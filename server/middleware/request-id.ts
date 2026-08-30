/*
  【文件职责】
    Nitro 中间件：为每个请求确定 requestId（沿用上游 x-request-id 或新生成），
    写入 event.context 并回写响应头，同时输出一条结构化访问日志。

  【架构位置】
    server 层 — Nitro middleware；requestId 是把访问日志、错误日志与客户端上报串起来的关联键。

  【主要导出 / 路由】
    default export（defineEventHandler）；作用于全部请求。

  【依赖关系】
    - 依赖：config/observability.ts（REQUEST_ID_HEADER）、server/utils/logger.ts
    - 被引用：Nitro 自动注册；server/plugins/error-capture.ts 与
      server/api/telemetry/errors.post.ts 读 event.context.requestId

  【渲染 / 数据】
    每个请求执行一次；不访问 API，不阻塞渲染。

  【边界与注意】
    只信任上游 requestId 的「形状」（长度与字符集），不信任内容 —— 否则外部可以往日志里注入任意文本。
    访问日志走 debug 级别：默认 info 下不输出，避免高流量站点被逐请求日志淹没。
*/
import { defineEventHandler, getRequestIP, getRequestURL, getHeader, setHeader } from 'h3'
import { REQUEST_ID_HEADER } from '../../config/observability'
import { logger } from '../utils/logger'

const SAFE_REQUEST_ID = /^[\w.-]{1,128}$/

const resolveRequestId = (incoming: string | undefined) =>
  incoming && SAFE_REQUEST_ID.test(incoming) ? incoming : crypto.randomUUID()

export default defineEventHandler((event) => {
  const requestId = resolveRequestId(getHeader(event, REQUEST_ID_HEADER))

  // 写进 context 供后续 handler 与错误钩子读取，同时回写响应头供上下游串联
  event.context.requestId = requestId
  setHeader(event, REQUEST_ID_HEADER, requestId)

  logger.debug('request', {
    requestId,
    method: event.method,
    path: getRequestURL(event).pathname,
    ip: getRequestIP(event, { xForwardedFor: true })
  })
})
