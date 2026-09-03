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
    publishedAt 带时间部分的用例是回归测试：修复前会拼出 Invalid Date 并让 Intl 抛 RangeError，
    在 SSR 的 /news 上表现为整页 500。
*/
import { describe, expect, it } from 'vitest'
import { SITE_INTL_LOCALE_MAP, SUPPORTED_LOCALES } from '../../config/site'
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

  it('accepts a full ISO timestamp for publishedAt', () => {
    // 后端把 publishedAt 返回成完整时间戳是完全合法的契约，不能因此 500
    expect(formatPublishedDate('2026-07-04T17:58:23.000Z', 'en-US')).toBe('July 4, 2026')
    expect(formatPublishedDate('2026-07-04T00:00:00Z', 'zh-CN')).toBe('2026年7月4日')
  })

  it('pins the date to UTC regardless of the runtime time zone', () => {
    // 固定 UTC：否则 UTC+8 与 UTC-5 的读者会看到不同的「同一天」
    expect(formatPublishedDate('2026-07-04T23:59:59.000Z', 'en-US')).toBe('July 4, 2026')
  })

  it('returns the raw value instead of throwing on an unparsable date', () => {
    expect(formatPublishedDate('not-a-date', 'en-US')).toBe('not-a-date')
    expect(formatPublishedDate('', 'zh-CN')).toBe('')
  })
})

describe('Intl locale tags', () => {
  it('uses a language tag Intl actually resolves for every supported locale', () => {
    // 站点内部标识不保证是合法 BCP 47：'ph' 不是语言码，Intl 不报错、直接回退到默认语言，
    // 于是菲律宾语下的日期全是英文格式而没有任何迹象。新增语言时这条会挡住同类问题。
    const fellBack = SUPPORTED_LOCALES.map((locale) => {
      const tag = SITE_INTL_LOCALE_MAP[locale]
      const resolved = new Intl.DateTimeFormat(tag).resolvedOptions().locale

      return { locale, tag, resolved }
    }).filter((entry) => entry.resolved.split('-')[0] !== entry.tag.split('-')[0])

    expect(fellBack, '这些 locale 的 Intl 标签被静默回退到了别的语言').toEqual([])
  })

  it('formats Filipino dates in Filipino rather than English', () => {
    expect(formatPublishedDate('2026-07-04', 'ph-PH')).toBe('Hulyo 4, 2026')
  })
})
