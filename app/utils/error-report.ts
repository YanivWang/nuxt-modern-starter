/*
  【文件职责】
    客户端错误上报载荷构建与去重：生成指纹、在时间窗内抑制重复、裁剪超长字段。
    传输本身留给调用方（app/plugins/error-reporter.client.ts），便于单测与替换后端。

  【架构位置】
    共享层 — app/utils，被 app/plugins/error-reporter.client.ts 消费。

  【主要导出 / 路由】
    buildClientErrorReport、createErrorReportDeduper、ClientErrorReport、ClientErrorKind

  【依赖关系】
    - 依赖：config/observability.ts（去重窗口、单字段字节预算）
    - 被引用：app/plugins/error-reporter.client.ts、tests/unit/error-report.test.ts

  【渲染 / 数据】
    纯函数 + 一个闭包状态的去重器；不触碰 window，可在 SSR 与单测中直接调用。

  【边界与注意】
    渲染错误会在一次 tick 内重复触发几十次，必须去重后再上报，否则一个坏组件就能把接口打满。
    指纹取 kind + 栈顶一帧 + message：同一抛出点的重复错误会收敛成一条，
    而不同抛出点的同名错误仍然区分得开。整条 stack 参与计算会让指纹过于敏感，失去去重效果。

    每个字段的上限来自 config/observability.ts 的 CLIENT_ERROR_FIELD_MAX_BYTES，
    与服务端 /api/telemetry/errors 共用同一份预算；本模块不再自己算一套。
*/
import {
  CLIENT_ERROR_DEDUPE_WINDOW_MS,
  CLIENT_ERROR_FIELD_MAX_BYTES
} from '../../config/observability'

export type ClientErrorKind = 'vue' | 'window' | 'unhandledrejection'

export type ClientErrorReport = {
  kind: ClientErrorKind
  message: string
  stack?: string
  path: string
  fingerprint: string
}

const TRUNCATION_MARKER = '…[truncated]'

const encoder = new TextEncoder()
const decoder = new TextDecoder()

const TRUNCATION_MARKER_BYTES = encoder.encode(TRUNCATION_MARKER).length

/**
 * 按 UTF-8 **字节**裁剪，不是按字符。
 * 服务端的体积上限以字节计，而一个汉字占三字节 —— 按字符裁剪时，
 * 同样「不超上限」的中文报告实际是英文报告的三倍大，会直接被 413 拒掉。
 */
const truncate = (value: string, maxBytes: number) => {
  const bytes = encoder.encode(value)

  if (bytes.length <= maxBytes) {
    return value
  }

  let end = Math.max(0, maxBytes - TRUNCATION_MARKER_BYTES)

  // 退到码点边界：UTF-8 续字节形如 10xxxxxx，从中间切开会解出替换字符
  while (end > 0 && (bytes[end]! & 0xc0) === 0x80) {
    end -= 1
  }

  return `${decoder.decode(bytes.subarray(0, end))}${TRUNCATION_MARKER}`
}

const toMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message || error.name
  }

  if (typeof error === 'string') {
    return error
  }

  try {
    return JSON.stringify(error) ?? String(error)
  } catch {
    return String(error)
  }
}

const toStack = (error: unknown) =>
  error instanceof Error && error.stack
    ? truncate(error.stack, CLIENT_ERROR_FIELD_MAX_BYTES.stack)
    : undefined

/**
 * 指纹只取栈顶一帧（stack 第 2 行）：足以区分抛出点，又不会被调用链的差异打散。
 * 栈帧排在 message 前面，因为超长 message 被裁掉尾巴时，先失去的应该是重复的报错文案，
 * 而不是唯一能区分抛出点的那一帧。
 */
const toFingerprint = (kind: ClientErrorKind, message: string, stack?: string) =>
  truncate(
    `${kind}:${stack?.split('\n')[1]?.trim() ?? ''}:${message}`,
    CLIENT_ERROR_FIELD_MAX_BYTES.fingerprint
  )

export const buildClientErrorReport = (
  kind: ClientErrorKind,
  error: unknown,
  path: string
): ClientErrorReport => {
  const message = truncate(toMessage(error), CLIENT_ERROR_FIELD_MAX_BYTES.message)
  const stack = toStack(error)

  return {
    kind,
    message,
    stack,
    // path 同样要裁：它来自 location.pathname，长度不受本模块控制
    path: truncate(path, CLIENT_ERROR_FIELD_MAX_BYTES.path),
    fingerprint: toFingerprint(kind, message, stack)
  }
}

/**
 * 时间窗去重：同一指纹在窗口内只放行一次。
 * 过期条目在每次判定时顺带清理，避免长会话里 Map 无限增长。
 */
export const createErrorReportDeduper = (windowMs = CLIENT_ERROR_DEDUPE_WINDOW_MS) => {
  const seen = new Map<string, number>()

  return {
    shouldReport: (fingerprint: string, now = Date.now()) => {
      for (const [key, seenAt] of seen) {
        if (now - seenAt >= windowMs) {
          seen.delete(key)
        }
      }

      const lastSeenAt = seen.get(fingerprint)

      if (lastSeenAt !== undefined && now - lastSeenAt < windowMs) {
        return false
      }

      seen.set(fingerprint, now)
      return true
    },
    size: () => seen.size
  }
}
