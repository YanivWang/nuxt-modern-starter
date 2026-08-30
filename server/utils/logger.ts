/*
  【文件职责】
    服务端结构化日志：输出单行 JSON（level / time / msg / requestId / 上下文），并对敏感字段脱敏。
    单行 JSON 是为了让 Loki、CloudWatch、Datadog 这类采集器直接解析，无需自定义 parser。

  【架构位置】
    server/utils — 被 server/middleware/request-id.ts、server/plugins/error-capture.ts、
    server/api/telemetry/errors.post.ts 使用。

  【主要导出 / 路由】
    logger、createLogger、redactValue、serializeError、LogFields

  【依赖关系】
    - 依赖：config/observability.ts（级别、脱敏字段）
    - 被引用：server/middleware/request-id.ts、server/plugins/error-capture.ts、
      server/api/telemetry/errors.post.ts、tests/unit/observability.test.ts

  【渲染 / 数据】
    仅服务端；级别在模块加载时由 NUXT_LOG_LEVEL 解析一次。

  【边界与注意】
    这里是「日志的唯一出口」—— 业务代码不要直接 console.*，否则脱敏与级别控制都会被绕过。
    脱敏按键名递归，深度上限 6 层，防止循环引用与超深对象拖垮请求。
*/
import {
  REDACTED_VALUE,
  SENSITIVE_KEY_PATTERNS,
  resolveLogLevel,
  LOG_LEVELS,
  type LogLevel
} from '../../config/observability'

export type LogFields = Record<string, unknown>

const MAX_REDACT_DEPTH = 6

const isSensitiveKey = (key: string) => {
  const normalized = key.toLowerCase()
  return SENSITIVE_KEY_PATTERNS.some((pattern) => normalized.includes(pattern))
}

/** 递归脱敏；命中敏感键名的值整体替换，不做部分保留（前缀也可能泄露信息） */
export const redactValue = (value: unknown, depth = 0): unknown => {
  if (depth >= MAX_REDACT_DEPTH) {
    return '[truncated]'
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactValue(item, depth + 1))
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [
        key,
        isSensitiveKey(key) ? REDACTED_VALUE : redactValue(item, depth + 1)
      ])
    )
  }

  return value
}

/** Error 不能直接 JSON.stringify（message/stack 是不可枚举属性），必须显式取字段 */
export const serializeError = (error: unknown) => {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...(error.cause ? { cause: String(error.cause) } : {})
    }
  }

  return { name: 'NonError', message: String(error) }
}

const write = (level: LogLevel, message: string, fields: LogFields) => {
  const line = JSON.stringify({
    level,
    time: new Date().toISOString(),
    msg: message,
    ...(redactValue(fields) as LogFields)
  })

  // error / warn 走 stderr，其余走 stdout：容器日志采集普遍按流分级
  if (level === 'error' || level === 'warn') {
    console.error(line)
    return
  }

  console.log(line)
}

export const createLogger = (level: LogLevel = resolveLogLevel(), base: LogFields = {}) => {
  const threshold = LOG_LEVELS.indexOf(level)

  const log =
    (target: LogLevel) =>
    (message: string, fields: LogFields = {}) => {
      if (LOG_LEVELS.indexOf(target) < threshold) {
        return
      }

      write(target, message, { ...base, ...fields })
    }

  return {
    level,
    debug: log('debug'),
    info: log('info'),
    warn: log('warn'),
    error: log('error'),
    /** 派生带固定字段的子 logger，例如绑定 requestId */
    child: (childFields: LogFields) => createLogger(level, { ...base, ...childFields })
  }
}

export type Logger = ReturnType<typeof createLogger>

export const logger = createLogger()
