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
