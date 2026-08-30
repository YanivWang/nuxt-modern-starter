/*
  【文件职责】
    单测：日志级别解析、结构化日志输出形状与敏感字段脱敏。

  【架构位置】
    tests/unit — config/observability.ts + server/utils/logger.ts，纯函数，无 Nuxt 运行时。

  【主要导出 / 路由】
    describe resolveLogLevel / redactValue / createLogger

  【依赖关系】
    - 依赖：config/observability.ts、server/utils/logger.ts
    - mock：console.log / console.error

  【渲染 / 数据】
    无

  【边界与注意】
    脱敏是安全边界：新增会携带凭据的字段名必须同时加进 SENSITIVE_KEY_PATTERNS 并在此补断言。
*/
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_LOG_LEVEL, REDACTED_VALUE, resolveLogLevel } from '../../config/observability'
import { createLogger, redactValue, serializeError } from '../../server/utils/logger'

const captureStdout = () => vi.spyOn(console, 'log').mockImplementation(() => {})
const captureStderr = () => vi.spyOn(console, 'error').mockImplementation(() => {})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('resolveLogLevel', () => {
  it('reads a valid level from the environment', () => {
    expect(resolveLogLevel({ NUXT_LOG_LEVEL: 'debug' } as NodeJS.ProcessEnv)).toBe('debug')
    expect(resolveLogLevel({ NUXT_LOG_LEVEL: ' WARN ' } as NodeJS.ProcessEnv)).toBe('warn')
  })

  it('falls back instead of throwing on an unknown level', () => {
    // 日志配置写错不应该让进程起不来
    expect(resolveLogLevel({ NUXT_LOG_LEVEL: 'loud' } as NodeJS.ProcessEnv)).toBe(DEFAULT_LOG_LEVEL)
    expect(resolveLogLevel({} as NodeJS.ProcessEnv)).toBe(DEFAULT_LOG_LEVEL)
  })
})

describe('redactValue', () => {
  it('redacts credential-bearing keys at any depth', () => {
    const redacted = redactValue({
      ok: 'visible',
      authorization: 'Bearer secret',
      nested: { refreshToken: 'r1', cookie: 'a=b', deeper: { apiKey: 'k' } }
    }) as Record<string, unknown>

    expect(redacted.ok).toBe('visible')
    expect(redacted.authorization).toBe(REDACTED_VALUE)
    expect(redacted.nested).toMatchObject({
      refreshToken: REDACTED_VALUE,
      cookie: REDACTED_VALUE,
      deeper: { apiKey: REDACTED_VALUE }
    })
  })

  it('matches key names case-insensitively and by substring', () => {
    const redacted = redactValue({
      Authorization: 'x',
      userPassword: 'y',
      X_API_KEY: 'z'
    }) as Record<string, unknown>

    expect(Object.values(redacted)).toEqual([REDACTED_VALUE, REDACTED_VALUE, REDACTED_VALUE])
  })

  it('walks arrays and stops at the depth limit', () => {
    expect(redactValue([{ token: 't' }, 'plain'])).toEqual([{ token: REDACTED_VALUE }, 'plain'])

    let deep: unknown = 'bottom'
    for (let i = 0; i < 10; i += 1) {
      deep = { next: deep }
    }

    expect(JSON.stringify(deep && redactValue(deep))).toContain('[truncated]')
  })
})

describe('serializeError', () => {
  it('extracts non-enumerable Error fields that JSON.stringify would drop', () => {
    expect(JSON.stringify(new Error('boom'))).toBe('{}')

    const serialized = serializeError(new Error('boom'))

    expect(serialized.name).toBe('Error')
    expect(serialized.message).toBe('boom')
    expect(serialized.stack).toContain('boom')
  })

  it('handles thrown non-Error values', () => {
    expect(serializeError('just a string')).toEqual({
      name: 'NonError',
      message: 'just a string'
    })
  })
})

describe('createLogger', () => {
  it('emits a single JSON line with level, time and message', () => {
    const stdout = captureStdout()
    createLogger('info').info('hello', { requestId: 'req-1' })

    expect(stdout).toHaveBeenCalledTimes(1)
    const line = JSON.parse(stdout.mock.calls[0]![0] as string)

    expect(line).toMatchObject({ level: 'info', msg: 'hello', requestId: 'req-1' })
    expect(Number.isNaN(Date.parse(line.time))).toBe(false)
  })

  it('suppresses records below the configured level', () => {
    const stdout = captureStdout()
    const stderr = captureStderr()
    const log = createLogger('warn')

    log.debug('d')
    log.info('i')
    log.warn('w')
    log.error('e')

    expect(stdout).not.toHaveBeenCalled()
    expect(stderr).toHaveBeenCalledTimes(2)
  })

  it('routes warn and error to stderr so container log collectors can split streams', () => {
    const stdout = captureStdout()
    const stderr = captureStderr()
    const log = createLogger('debug')

    log.info('i')
    log.error('e')

    expect(stdout).toHaveBeenCalledTimes(1)
    expect(stderr).toHaveBeenCalledTimes(1)
  })

  it('redacts fields on the way out', () => {
    const stderr = captureStderr()
    createLogger('error').error('failed', { authorization: 'Bearer leak' })

    expect(stderr.mock.calls[0]![0]).not.toContain('leak')
    expect(stderr.mock.calls[0]![0]).toContain(REDACTED_VALUE)
  })

  it('binds fixed fields through child loggers', () => {
    const stdout = captureStdout()
    createLogger('info').child({ requestId: 'req-9' }).info('scoped', { extra: 1 })

    expect(JSON.parse(stdout.mock.calls[0]![0] as string)).toMatchObject({
      requestId: 'req-9',
      extra: 1
    })
  })
})
