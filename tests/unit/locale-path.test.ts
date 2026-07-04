import { describe, expect, it } from 'vitest'
import { localizedPath } from '../../config/routes'
import { getSwitchLanguageUrl, relativeLangPath } from '../../i18n'

describe('locale path utilities', () => {
  it('keeps default language without prefix', () => {
    expect(localizedPath('/', 'zh-CN')).toBe('/')
    expect(localizedPath('/pricing', 'zh-CN')).toBe('/pricing')
  })

  it('adds prefix for non-default language', () => {
    expect(localizedPath('/', 'en-US')).toBe('/en')
    expect(localizedPath('/pricing', 'en-US')).toBe('/en/pricing')
  })

  it('keeps relative path when switching language', () => {
    expect(relativeLangPath('/en/news/starter-release')).toBe('/news/starter-release')
    expect(getSwitchLanguageUrl('/en/pricing', 'zh-CN', '?plan=growth#faq')).toBe(
      '/pricing?plan=growth#faq'
    )
    expect(getSwitchLanguageUrl('/pricing', 'en-US')).toBe('/en/pricing')
  })
})
