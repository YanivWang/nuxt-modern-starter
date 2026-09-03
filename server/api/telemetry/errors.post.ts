/*
  【文件职责】
    第一方客户端错误接收端点：校验体积与形状、按 IP 限流，然后写入结构化日志。
    有了它，浏览器侧的报错才会出现在与服务端日志同一条流里，并共享 requestId 关联键。

  【架构位置】
    server/api — 被 app/plugins/error-reporter.client.ts 调用。

  【主要导出 / 路由】
    POST /api/telemetry/errors

  【依赖关系】
    - 依赖：config/observability.ts、server/utils/client-ip.ts、server/utils/logger.ts、
      server/utils/rate-limit.ts
    - 被引用：app/plugins/error-reporter.client.ts、tests/unit/error-report.test.ts

  【渲染 / 数据】
    只写日志，不落库：日志采集器（Loki / CloudWatch / Datadog）已经是这类数据的归宿。

  【边界与注意】
    这是公开可写端点，必须同时有体积上限与限流 —— 否则任何人都能往日志里灌数据。
    体积上限在解析之前生效（先看 content-length，再量原始字节），否则「上限」只挡日志不挡开销。
    单字段上限与客户端共用 config/observability.ts 的 CLIENT_ERROR_FIELD_MAX_BYTES，
    两侧各写一套数字时，超限的表现是报告静默消失而不是报错。
    限流 key 必须来自 server/utils/client-ip.ts —— 它按 NUXT_TRUSTED_PROXY_DEPTH 取真实来源。
    直接用 x-forwarded-for 的最左项时，换个请求头就能绕过配额，限流等于没有。
    限流按进程计数，横向扩容后真实上限是 N × CLIENT_ERROR_MAX_PER_MINUTE；
    需要精确全局配额时在网关层补。
*/
import { createError, defineEventHandler, getHeader, readRawBody, setResponseStatus } from 'h3'
import {
  CLIENT_ERROR_FIELD_MAX_BYTES,
  CLIENT_ERROR_MAX_BODY_BYTES,
  CLIENT_ERROR_MAX_PER_MINUTE
} from '../../../config/observability'
import { getClientIp } from '../../utils/client-ip'
import { logger } from '../../utils/logger'
import { createRateLimiter } from '../../utils/rate-limit'

const rateLimiter = createRateLimiter({
  windowMs: 60_000,
  max: CLIENT_ERROR_MAX_PER_MINUTE
})

export const resetTelemetryRateLimitForTests = () => rateLimiter.reset()

const KINDS = new Set(['vue', 'window', 'unhandledrejection'])

/**
 * 上限按字节而不是字符：与客户端裁剪、与 CLIENT_ERROR_MAX_BODY_BYTES 用同一把尺子。
 * 按字符切的话，同样「合规」的中文载荷实际是英文的三倍大，两侧对不上账。
 */
const asString = (value: unknown, maxBytes: number) => {
  if (typeof value !== 'string') {
    return undefined
  }

  const bytes = Buffer.from(value, 'utf8')

  if (bytes.length <= maxBytes) {
    return value
  }

  let end = maxBytes

  // 退到码点边界，避免切出半个字符
  while (end > 0 && (bytes[end]! & 0xc0) === 0x80) {
    end -= 1
  }

  return bytes.subarray(0, end).toString('utf8')
}

/** 只接受已知形状；未知字段一律丢弃，避免调用方把任意内容写进日志 */
export const normalizeClientErrorReport = (body: unknown) => {
  if (!body || typeof body !== 'object') {
    return null
  }

  const payload = body as Record<string, unknown>
  const kind = asString(payload.kind, CLIENT_ERROR_FIELD_MAX_BYTES.kind)
  const message = asString(payload.message, CLIENT_ERROR_FIELD_MAX_BYTES.message)

  if (!kind || !KINDS.has(kind) || !message) {
    return null
  }

  return {
    kind,
    message,
    stack: asString(payload.stack, CLIENT_ERROR_FIELD_MAX_BYTES.stack),
    path: asString(payload.path, CLIENT_ERROR_FIELD_MAX_BYTES.path),
    fingerprint: asString(payload.fingerprint, CLIENT_ERROR_FIELD_MAX_BYTES.fingerprint)
  }
}

/**
 * 体积检查必须发生在 JSON.parse 之前。
 * 上一版先 readBody 解析，再拿解析结果重新 stringify 去量长度 —— 那时超大载荷
 * 早已完整读进内存并解析完了，「上限」只挡住了写日志，没挡住开销本身。
 */
const readBodyWithinLimit = async (event: Parameters<typeof getHeader>[0]) => {
  const declaredLength = Number(getHeader(event, 'content-length'))

  if (Number.isFinite(declaredLength) && declaredLength > CLIENT_ERROR_MAX_BODY_BYTES) {
    throw createError({ statusCode: 413, statusMessage: 'Payload Too Large' })
  }

  // 分块传输时没有 content-length，仍要按实际字节数兜一次
  const raw = await readRawBody(event, false)

  if (raw && raw.length > CLIENT_ERROR_MAX_BODY_BYTES) {
    throw createError({ statusCode: 413, statusMessage: 'Payload Too Large' })
  }

  if (!raw?.length) {
    return null
  }

  try {
    return JSON.parse(raw.toString('utf8')) as unknown
  } catch {
    // 解析失败与形状不合法归到同一条出口：都是 400
    return null
  }
}

export default defineEventHandler(async (event) => {
  // 限流 key 走 getClientIp，不用 getRequestIP 的 xForwardedFor：后者取的是可伪造的最左项
  if (!rateLimiter.consume(getClientIp(event))) {
    throw createError({ statusCode: 429, statusMessage: 'Too Many Requests' })
  }

  const report = normalizeClientErrorReport(await readBodyWithinLimit(event))

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
