/*
  【文件职责】
    可观测性常量单一来源：日志级别、脱敏字段、请求 id 头、可信代理层数、
    客户端错误上报端点与配额。

  【架构位置】
    config 层 — 被 server/utils/logger.ts、server/middleware/request-id.ts、
    server/api/telemetry/errors.post.ts、app/utils/error-report.ts 共享引用。

  【主要导出 / 路由】
    LOG_LEVELS、LogLevel、DEFAULT_LOG_LEVEL、isLogLevel、resolveLogLevel、REDACTED_VALUE、
    SENSITIVE_KEY_PATTERNS、REQUEST_ID_HEADER、DEFAULT_TRUSTED_PROXY_DEPTH、
    resolveTrustedProxyDepth、CLIENT_ERROR_ENDPOINT、
    CLIENT_ERROR_MAX_PER_MINUTE、CLIENT_ERROR_FIELD_MAX_BYTES、CLIENT_ERROR_ENVELOPE_BYTES、
    CLIENT_ERROR_MAX_BODY_BYTES、CLIENT_ERROR_DEDUPE_WINDOW_MS

  【依赖关系】
    - 依赖：无（纯常量，仅 resolveLogLevel 读传入的 env）
    - 被引用：server/utils/logger.ts、server/utils/client-ip.ts、server/middleware/request-id.ts、
      server/api/telemetry/errors.post.ts、server/api/revalidate.post.ts、
      app/utils/error-report.ts、app/plugins/error-reporter.client.ts、
      tests/unit/observability.test.ts

  【渲染 / 数据】
    无 — 编译期常量；日志级别与可信代理层数在进程启动时由 NUXT_LOG_LEVEL /
    NUXT_TRUSTED_PROXY_DEPTH 各解析一次。

  【边界与注意】
    SENSITIVE_KEY_PATTERNS 是日志脱敏的唯一来源；新增会携带凭据的字段名必须加在这里，
    否则令牌会进日志。修改需同步 tests/unit/observability.test.ts。

    CLIENT_ERROR_* 这组常量是客户端与服务端共用的同一份预算，不允许任一侧自己算一套 ——
    上报链路两端对「上限是什么」理解不一致时，超限只会表现为报告凭空消失。
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

/**
 * 本服务前面有几层**可信**反向代理。0 表示直接对外，不信任 x-forwarded-for。
 *
 * 这个值决定「客户端 IP 从哪里取」，而客户端 IP 是限流的 key ——
 * 取错的后果不是日志难看，是限流形同虚设：
 * h3 的 getRequestIP(event, { xForwardedFor: true }) 取的是 x-forwarded-for 的**最左**一项，
 * 而最左那项完全由客户端自己写。nginx 的 $proxy_add_x_forwarded_for 是往右**追加**真实来源，
 * 所以真实客户端在右数第 depth 项。按最左取值时，攻击者每次换一个伪造 IP 就能绕过配额，
 * 顺带把限流器的 bucket 表撑到无限大。
 *
 * 默认 0 是「不知道前面有没有代理时的安全选择」：宁可所有流量共用 socket 地址，
 * 也不接受一个能被伪造的 key。仓库自带的 Nginx 网关栈在 compose 里显式设为 1。
 */
export const DEFAULT_TRUSTED_PROXY_DEPTH = 0

/** 非法值（负数、非整数、非数字）回退默认值：代理配置写错不该让进程起不来 */
export const resolveTrustedProxyDepth = (env: NodeJS.ProcessEnv = process.env): number => {
  const parsed = Number(env.NUXT_TRUSTED_PROXY_DEPTH)

  return Number.isInteger(parsed) && parsed >= 0 ? parsed : DEFAULT_TRUSTED_PROXY_DEPTH
}

/** 客户端错误上报的第一方端点；换 Sentry 等托管方案时只需改 app/utils/error-report.ts 的传输实现 */
export const CLIENT_ERROR_ENDPOINT = '/api/telemetry/errors'

/** 单 IP 每分钟最多接收的客户端错误条数，防止异常循环把日志打爆 */
export const CLIENT_ERROR_MAX_PER_MINUTE = 30

/**
 * 上报载荷的单字段字节上限 —— 客户端按它裁剪，服务端按它收口，只此一份。
 *
 * 两侧各写一套数字是上一版的实际问题：客户端按「体积上限 ÷ 4」算的是**字符数**，
 * 服务端按另一组硬编码字符数切，谁也不知道合起来会不会超过体积上限。
 * 于是一条中文报错（UTF-8 三字节/字）就能把载荷顶到 16KB 以上被 413 拒掉，
 * 而客户端对上报失败是静默的 —— 错误上报在最需要它的时候恰好不工作。
 */
export const CLIENT_ERROR_FIELD_MAX_BYTES = {
  kind: 32,
  message: 2000,
  stack: 8000,
  path: 500,
  fingerprint: 300
} as const

/** JSON 键名、引号、逗号与花括号的固定开销上限 */
export const CLIENT_ERROR_ENVELOPE_BYTES = 128

/**
 * 单条上报体最大字节数，超过直接拒绝。
 *
 * 取值必须容得下「每个字段都写满、且每个字节都需要 JSON 转义」的最坏情况
 * （转义最多让字节数翻倍，如整段换行的 stack）。否则这个上限就退化成
 * 「大部分时候够用」，剩下的情况变成静默丢报告。
 * 该不等式由 tests/unit/error-report.test.ts 守住，改任一常数都会被算出来。
 */
export const CLIENT_ERROR_MAX_BODY_BYTES = 32 * 1024

/** 同一指纹在该窗口内只上报一次，避免渲染循环里的同一错误刷屏 */
export const CLIENT_ERROR_DEDUPE_WINDOW_MS = 10_000
