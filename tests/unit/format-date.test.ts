import { describe, expect, it } from 'vitest'
import { formatPublishedDate } from '../../app/utils/formatDate'

describe('formatPublishedDate', () => {
  it('formats dates for supported locales', () => {
    expect(formatPublishedDate('2026-07-04', 'en-US')).toBe('July 4, 2026')
    expect(formatPublishedDate('2026-07-04', 'zh-CN')).toBe('2026年7月4日')
  })
})
