/*
  【文件职责】
    单测：formatDateOnly、formatPublishedDate 按 locale 格式化。

  【架构位置】
    tests/unit — app/utils/formatDate.ts。

  【主要导出 / 路由】
    describe formatDateOnly / formatPublishedDate

  【依赖关系】
    - 依赖：app/utils/formatDate.ts
    - mock：无

  【渲染 / 数据】
    无

  【边界与注意】
    不覆盖 formatWorkspaceDateTime；非法 ISO 边界不测全时区。
*/
import { describe, expect, it } from 'vitest'
import { formatDateOnly, formatPublishedDate } from '../../app/utils/formatDate'

describe('formatDateOnly', () => {
  it('returns only the date portion from ISO datetime strings', () => {
    expect(formatDateOnly('2026-07-05T17:58:23.000Z')).toBe('2026-07-05')
    expect(formatDateOnly('2026-07-04')).toBe('2026-07-04')
  })
})

describe('formatPublishedDate', () => {
  it('formats dates for supported locales', () => {
    expect(formatPublishedDate('2026-07-04', 'en-US')).toBe('July 4, 2026')
    expect(formatPublishedDate('2026-07-04', 'zh-CN')).toBe('2026年7月4日')
  })
})
