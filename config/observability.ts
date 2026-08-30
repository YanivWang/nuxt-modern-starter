/*
  【文件职责】
    可观测性常量单一来源：日志级别、脱敏字段、请求 id 头、客户端错误上报端点与配额。

  【架构位置】
    config 层 — 被 server/utils/logger.ts、server/middleware/request-id.ts、
    server/api/telemetry/errors.post.ts、app/utils/error-report.ts 共享引用。

  【主要导出 / 路由】
    LOG_LEVELS、LogLevel、DEFAULT_LOG_LEVEL、isLogLevel、resolveLogLevel、REDACTED_VALUE、
    SENSITIVE_KEY_PATTERNS、REQUEST_ID_HEADER、CLIENT_ERROR_ENDPOINT、
    CLIENT_ERROR_MAX_PER_MINUTE、CLIENT_ERROR_MAX_BODY_BYTES、CLIENT_ERROR_DEDUPE_WINDOW_MS

  【依赖关系】
    - 依赖：无（纯常量，仅 resolveLogLevel 读传入的 env）
    - 被引用：server/utils/logger.ts、server/middleware/request-id.ts、
      server/api/telemetry/errors.post.ts、app/utils/error-report.ts、
      app/plugins/error-reporter.client.ts、tests/unit/observability.test.ts

  【渲染 / 数据】
    无 — 编译期常量；日志级别在进程启动时由 NUXT_LOG_LEVEL 解析一次。

  【边界与注意】
    SENSITIVE_KEY_PATTERNS 是日志脱敏的唯一来源；新增会携带凭据的字段名必须加在这里，
    否则令牌会进日志。修改需同步 tests/unit/observability.test.ts。
*/

/** 由低到高；resolveLogLevel 之下的级别不输出 */
export const LOG_LEVELS = ['debug', 'info', 'warn', 'error'] as const

export type LogLevel = (typeof LOG_LEVELS)[number]

export const DEFAULT_LOG_LEVEL: LogLevel = 'info'

export const isLogLevel = (value: string): value is LogLevel =>
  LOG_LEVELS.includes(value as LogLevel)

/** 无效值不抛错：日志配置错误不应该让进程起不来，回退默认级别即可 */
export const resolveLogLevel = (env: NodeJS.ProcessEnv = process.env): LogLevel => {
  const raw = env.NUXT_LOG_LEVEL?.trim().toLowerCase()

  return raw && isLogLevel(raw) ? raw : DEFAULT_LOG_LEVEL
}

export const REDACTED_VALUE = '[redacted]'

/**
 * 命中即整体替换为 [redacted]，大小写不敏感，按「键名包含」匹配。
 * 与 app/lib/http/headers.ts 的 sanitizeHeaders 分工：那里只管出站请求头，这里管日志与上报载荷。
 */
export const SENSITIVE_KEY_PATTERNS = [
  'authorization',
  'cookie',
  'token',
  'password',
  'secret',
  'credential',
  'apikey',
  'api_key'
] as const

/** 入站沿用上游 id，缺失时本进程生成；同名响应头回写，便于跨服务串联 */
export const REQUEST_ID_HEADER = 'x-request-id'

/** 客户端错误上报的第一方端点；换 Sentry 等托管方案时只需改 app/utils/error-report.ts 的传输实现 */
export const CLIENT_ERROR_ENDPOINT = '/api/telemetry/errors'

/** 单 IP 每分钟最多接收的客户端错误条数，防止异常循环把日志打爆 */
export const CLIENT_ERROR_MAX_PER_MINUTE = 30

/** 单条上报体最大字节数，超过直接拒绝 */
export const CLIENT_ERROR_MAX_BODY_BYTES = 16 * 1024

/** 同一指纹在该窗口内只上报一次，避免渲染循环里的同一错误刷屏 */
export const CLIENT_ERROR_DEDUPE_WINDOW_MS = 10_000
