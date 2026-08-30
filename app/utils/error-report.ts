/*
  【文件职责】
    客户端错误上报载荷构建与去重：生成指纹、在时间窗内抑制重复、裁剪超长字段。
    传输本身留给调用方（app/plugins/error-reporter.client.ts），便于单测与替换后端。

  【架构位置】
    共享层 — app/utils，被 app/plugins/error-reporter.client.ts 消费。

  【主要导出 / 路由】
    buildClientErrorReport、createErrorReportDeduper、ClientErrorReport、ClientErrorKind

  【依赖关系】
    - 依赖：config/observability.ts（去重窗口、体积上限）
    - 被引用：app/plugins/error-reporter.client.ts、tests/unit/error-report.test.ts

  【渲染 / 数据】
    纯函数 + 一个闭包状态的去重器；不触碰 window，可在 SSR 与单测中直接调用。

  【边界与注意】
    渲染错误会在一次 tick 内重复触发几十次，必须去重后再上报，否则一个坏组件就能把接口打满。
    指纹取 kind + message + 栈顶一帧：同一抛出点的重复错误会收敛成一条，
    而不同抛出点的同名错误仍然区分得开。整条 stack 参与计算会让指纹过于敏感，失去去重效果。
*/
import {
  CLIENT_ERROR_DEDUPE_WINDOW_MS,
  CLIENT_ERROR_MAX_BODY_BYTES
} from '../../config/observability'

export type ClientErrorKind = 'vue' | 'window' | 'unhandledrejection'

export type ClientErrorReport = {
  kind: ClientErrorKind
  message: string
  stack?: string
  path: string
  fingerprint: string
}

/** 单字段裁剪上限：留出余量，保证整体载荷不超过服务端的 CLIENT_ERROR_MAX_BODY_BYTES */
const MAX_FIELD_LENGTH = Math.floor(CLIENT_ERROR_MAX_BODY_BYTES / 4)

const truncate = (value: string) =>
  value.length > MAX_FIELD_LENGTH ? `${value.slice(0, MAX_FIELD_LENGTH)}…[truncated]` : value

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
  error instanceof Error && error.stack ? truncate(error.stack) : undefined

/** 指纹只取栈顶一帧（stack 第 2 行）：足以区分抛出点，又不会被调用链的差异打散 */
const toFingerprint = (kind: ClientErrorKind, message: string, stack?: string) =>
  `${kind}:${message}:${stack?.split('\n')[1]?.trim() ?? ''}`

export const buildClientErrorReport = (
  kind: ClientErrorKind,
  error: unknown,
  path: string
): ClientErrorReport => {
  const message = truncate(toMessage(error))
  const stack = toStack(error)

  return {
    kind,
    message,
    stack,
    path,
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
