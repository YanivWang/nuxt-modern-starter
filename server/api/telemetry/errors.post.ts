/*
  【文件职责】
    第一方客户端错误接收端点：校验体积与形状、按 IP 限流，然后写入结构化日志。
    有了它，浏览器侧的报错才会出现在与服务端日志同一条流里，并共享 requestId 关联键。

  【架构位置】
    server/api — 被 app/plugins/error-reporter.client.ts 调用。

  【主要导出 / 路由】
    POST /api/telemetry/errors

  【依赖关系】
    - 依赖：config/observability.ts、server/utils/logger.ts、server/utils/rate-limit.ts
    - 被引用：app/plugins/error-reporter.client.ts、tests/unit/telemetry-errors.test.ts

  【渲染 / 数据】
    只写日志，不落库：日志采集器（Loki / CloudWatch / Datadog）已经是这类数据的归宿。

  【边界与注意】
    这是公开可写端点，必须同时有体积上限与限流 —— 否则任何人都能往日志里灌数据。
    限流按进程计数，横向扩容后真实上限是 N × CLIENT_ERROR_MAX_PER_MINUTE；
    需要精确全局配额时在网关层补。
*/
import { createError, defineEventHandler, getRequestIP, readBody, setResponseStatus } from 'h3'
import {
  CLIENT_ERROR_MAX_BODY_BYTES,
  CLIENT_ERROR_MAX_PER_MINUTE
} from '../../../config/observability'
import { logger } from '../../utils/logger'
import { createRateLimiter } from '../../utils/rate-limit'

const rateLimiter = createRateLimiter({
  windowMs: 60_000,
  max: CLIENT_ERROR_MAX_PER_MINUTE
})

export const resetTelemetryRateLimitForTests = () => rateLimiter.reset()

const KINDS = new Set(['vue', 'window', 'unhandledrejection'])

const asString = (value: unknown, max: number) =>
  typeof value === 'string' ? value.slice(0, max) : undefined

/** 只接受已知形状；未知字段一律丢弃，避免调用方把任意内容写进日志 */
export const normalizeClientErrorReport = (body: unknown) => {
  if (!body || typeof body !== 'object') {
    return null
  }

  const payload = body as Record<string, unknown>
  const kind = asString(payload.kind, 32)
  const message = asString(payload.message, 2000)

  if (!kind || !KINDS.has(kind) || !message) {
    return null
  }

  return {
    kind,
    message,
    stack: asString(payload.stack, 8000),
    path: asString(payload.path, 500),
    fingerprint: asString(payload.fingerprint, 500)
  }
}

export default defineEventHandler(async (event) => {
  const rateLimitKey = getRequestIP(event, { xForwardedFor: true }) || 'unknown'

  if (!rateLimiter.consume(rateLimitKey)) {
    throw createError({ statusCode: 429, statusMessage: 'Too Many Requests' })
  }

  const body = await readBody(event)

  if (Buffer.byteLength(JSON.stringify(body ?? null)) > CLIENT_ERROR_MAX_BODY_BYTES) {
    throw createError({ statusCode: 413, statusMessage: 'Payload Too Large' })
  }

  const report = normalizeClientErrorReport(body)

  if (!report) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid error report' })
  }

  logger.error('client error', {
    requestId: event.context.requestId,
    source: 'client',
    ...report
  })

  // 上报是「发了就算」的旁路，返回 204 让客户端无需解析响应体
  setResponseStatus(event, 204)

  return null
})
