/*
  【文件职责】
    单测：客户端错误上报的载荷构建、时间窗去重与服务端入参归一化。

  【架构位置】
    tests/unit — app/utils/error-report.ts + server/api/telemetry/errors.post.ts 的纯函数部分。

  【主要导出 / 路由】
    describe buildClientErrorReport / createErrorReportDeduper / normalizeClientErrorReport

  【依赖关系】
    - 依赖：app/utils/error-report.ts、server/api/telemetry/errors.post.ts
    - mock：无（now 由参数注入）

  【渲染 / 数据】
    无

  【边界与注意】
    去重是把「一个坏组件打满上报接口」挡在前面的第一道闸；归一化是公开可写端点的输入边界。
*/
import { describe, expect, it } from 'vitest'
import { buildClientErrorReport, createErrorReportDeduper } from '../../app/utils/error-report'
import { normalizeClientErrorReport } from '../../server/api/telemetry/errors.post'

describe('buildClientErrorReport', () => {
  it('captures message, stack and path from an Error', () => {
    const report = buildClientErrorReport('vue', new Error('render failed'), '/workspace')

    expect(report).toMatchObject({ kind: 'vue', message: 'render failed', path: '/workspace' })
    expect(report.stack).toContain('render failed')
    expect(report.fingerprint.startsWith('vue:render failed:')).toBe(true)
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

  it('truncates oversized messages so one report cannot exceed the body cap', () => {
    const report = buildClientErrorReport('window', new Error('x'.repeat(50_000)), '/')

    expect(report.message.endsWith('…[truncated]')).toBe(true)
    expect(report.message.length).toBeLessThan(5000)
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

  it('caps field lengths', () => {
    const normalized = normalizeClientErrorReport({
      kind: 'vue',
      message: 'm'.repeat(9000),
      stack: 's'.repeat(20_000)
    })

    expect(normalized?.message).toHaveLength(2000)
    expect(normalized?.stack).toHaveLength(8000)
  })
})
