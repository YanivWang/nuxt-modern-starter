/*
  【文件职责】
    单测：客户端错误上报的载荷构建、时间窗去重与服务端入参归一化。

  【架构位置】
    tests/unit — app/utils/error-report.ts + server/api/telemetry/errors.post.ts 的纯函数部分。

  【主要导出 / 路由】
    describe buildClientErrorReport / createErrorReportDeduper / normalizeClientErrorReport

  【依赖关系】
    - 依赖：app/utils/error-report.ts、server/api/telemetry/errors.post.ts、config/observability.ts
    - mock：无（now 由参数注入）

  【渲染 / 数据】
    无

  【边界与注意】
    去重是把「一个坏组件打满上报接口」挡在前面的第一道闸；归一化是公开可写端点的输入边界。

    体积断言一律以 UTF-8 字节为准，并且直接量整条序列化载荷。
    只断言「某个字段短于某个数」是量不出问题的 —— 按字符裁剪的 bug 就是这么活下来的。
*/
import { describe, expect, it } from 'vitest'
import {
  CLIENT_ERROR_ENVELOPE_BYTES,
  CLIENT_ERROR_FIELD_MAX_BYTES,
  CLIENT_ERROR_MAX_BODY_BYTES
} from '../../config/observability'
import { buildClientErrorReport, createErrorReportDeduper } from '../../app/utils/error-report'
import { normalizeClientErrorReport } from '../../server/api/telemetry/errors.post'

const utf8Bytes = (value: string) => Buffer.byteLength(value, 'utf8')

describe('buildClientErrorReport', () => {
  it('captures message, stack and path from an Error', () => {
    const report = buildClientErrorReport('vue', new Error('render failed'), '/workspace')

    expect(report).toMatchObject({ kind: 'vue', message: 'render failed', path: '/workspace' })
    expect(report.stack).toContain('render failed')
    // 指纹形如 kind:栈顶一帧:message —— 栈帧在前，超长 message 被裁时先失去的是报错文案
    expect(report.fingerprint.startsWith('vue:')).toBe(true)
    expect(report.fingerprint.endsWith(':render failed')).toBe(true)
  })

  it('handles thrown strings and objects without crashing', () => {
    expect(buildClientErrorReport('window', 'boom', '/').message).toBe('boom')
    expect(buildClientErrorReport('unhandledrejection', { code: 42 }, '/').message).toBe(
      '{"code":42}'
    )
  })

  it('collapses repeats of the same throw site onto one fingerprint', () => {
    // 同一抛出点重复触发（渲染循环里的典型形态）必须收敛成一条
    const raise = () => new Error('same')

    expect(buildClientErrorReport('vue', raise(), '/a').fingerprint).toBe(
      buildClientErrorReport('vue', raise(), '/b').fingerprint
    )
  })

  it('keeps different throw sites distinguishable', () => {
    const fromA = () => new Error('same')
    const fromB = () => new Error('same')

    expect(buildClientErrorReport('vue', fromA(), '/').fingerprint).not.toBe(
      buildClientErrorReport('vue', fromB(), '/').fingerprint
    )
  })

  it('keeps a maxed-out report inside the server body cap', () => {
    // 断言的是「整条载荷序列化后仍在服务端上限内」，而不是「某个字段短于某个随手挑的数」。
    // 上一版只断言 message.length < 5000，于是按字符裁剪的 bug 一直被判为通过。
    const error = new Error('x'.repeat(50_000))
    error.stack = `Error: boom\n${'    at frame (webpack://app/a.vue:1:1)\n'.repeat(2000)}`

    const report = buildClientErrorReport('window', error, `/${'p'.repeat(5000)}`)

    expect(report.message.endsWith('…[truncated]')).toBe(true)
    expect(utf8Bytes(JSON.stringify(report))).toBeLessThanOrEqual(CLIENT_ERROR_MAX_BODY_BYTES)
  })

  it('budgets by UTF-8 bytes, so a CJK report is no larger than an ASCII one', () => {
    // 这是原来的实际故障：按字符裁剪时，一条中文报错的载荷是英文的三倍，直接被 413 丢掉
    const error = new Error('渲染失败：读取属性出错。'.repeat(5000))
    error.stack = `Error\n${'    at 组件 (webpack://应用/页面.vue:1:1)\n'.repeat(2000)}`

    const report = buildClientErrorReport('vue', error, '/工作台')

    expect(utf8Bytes(report.message)).toBeLessThanOrEqual(CLIENT_ERROR_FIELD_MAX_BYTES.message)
    expect(utf8Bytes(report.stack ?? '')).toBeLessThanOrEqual(CLIENT_ERROR_FIELD_MAX_BYTES.stack)
    expect(utf8Bytes(report.fingerprint)).toBeLessThanOrEqual(
      CLIENT_ERROR_FIELD_MAX_BYTES.fingerprint
    )
    expect(utf8Bytes(JSON.stringify(report))).toBeLessThanOrEqual(CLIENT_ERROR_MAX_BODY_BYTES)
  })

  it('never splits a multi-byte character when truncating', () => {
    const report = buildClientErrorReport('vue', new Error('汉'.repeat(5000)), '/')

    // 切在码点中间会解出替换字符 U+FFFD
    expect(report.message).not.toContain('\uFFFD')
  })
})

describe('client error budget', () => {
  it('fits the worst case where every byte needs JSON escaping', () => {
    // 转义最多让字节数翻倍（整段换行的 stack 就是这种）。
    // 这条不等式不成立时，「体积上限」只是大部分时候够用，剩下的情况静默丢报告。
    const fieldBytes = Object.values(CLIENT_ERROR_FIELD_MAX_BYTES).reduce(
      (sum, bytes) => sum + bytes,
      0
    )

    expect(fieldBytes * 2 + CLIENT_ERROR_ENVELOPE_BYTES).toBeLessThanOrEqual(
      CLIENT_ERROR_MAX_BODY_BYTES
    )
  })
})

describe('createErrorReportDeduper', () => {
  it('reports a fingerprint once per window', () => {
    const deduper = createErrorReportDeduper(1000)

    expect(deduper.shouldReport('fp', 0)).toBe(true)
    expect(deduper.shouldReport('fp', 500)).toBe(false)
    expect(deduper.shouldReport('fp', 1000)).toBe(true)
  })

  it('keeps distinct fingerprints independent', () => {
    const deduper = createErrorReportDeduper(1000)

    expect(deduper.shouldReport('a', 0)).toBe(true)
    expect(deduper.shouldReport('b', 0)).toBe(true)
  })

  it('drops expired entries instead of growing without bound', () => {
    const deduper = createErrorReportDeduper(1000)

    for (let i = 0; i < 20; i += 1) {
      deduper.shouldReport(`fp-${i}`, 0)
    }
    expect(deduper.size()).toBe(20)

    deduper.shouldReport('fp-new', 5000)
    expect(deduper.size()).toBe(1)
  })
})

describe('normalizeClientErrorReport', () => {
  it('accepts a well-formed report', () => {
    expect(
      normalizeClientErrorReport({
        kind: 'vue',
        message: 'boom',
        stack: 's',
        path: '/x',
        fingerprint: 'f'
      })
    ).toEqual({ kind: 'vue', message: 'boom', stack: 's', path: '/x', fingerprint: 'f' })
  })

  it('rejects unknown kinds, missing messages and non-objects', () => {
    expect(normalizeClientErrorReport({ kind: 'evil', message: 'x' })).toBeNull()
    expect(normalizeClientErrorReport({ kind: 'vue' })).toBeNull()
    expect(normalizeClientErrorReport('nope')).toBeNull()
    expect(normalizeClientErrorReport(null)).toBeNull()
  })

  it('drops unknown fields so callers cannot write arbitrary keys into logs', () => {
    const normalized = normalizeClientErrorReport({
      kind: 'window',
      message: 'ok',
      authorization: 'Bearer leak',
      injected: 'x'
    })

    expect(Object.keys(normalized ?? {}).sort()).toEqual([
      'fingerprint',
      'kind',
      'message',
      'path',
      'stack'
    ])
  })

  it('caps fields by the shared byte budget, not by character count', () => {
    const normalized = normalizeClientErrorReport({
      kind: 'vue',
      message: 'm'.repeat(9000),
      stack: 's'.repeat(20_000)
    })

    expect(utf8Bytes(normalized!.message)).toBe(CLIENT_ERROR_FIELD_MAX_BYTES.message)
    expect(utf8Bytes(normalized!.stack ?? '')).toBe(CLIENT_ERROR_FIELD_MAX_BYTES.stack)

    // 中文按字节切：字符数只有上限的三分之一，字节数才是被限住的那个量
    const cjk = normalizeClientErrorReport({ kind: 'vue', message: '汉'.repeat(9000) })

    expect(utf8Bytes(cjk!.message)).toBeLessThanOrEqual(CLIENT_ERROR_FIELD_MAX_BYTES.message)
    expect(cjk!.message).not.toContain('\uFFFD')
  })
})
