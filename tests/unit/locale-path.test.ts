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

  it('does not add language prefixes to authenticated product paths', () => {
    expect(localizedPath('/app/workspace', 'en-US')).toBe('/app/workspace')
    expect(localizedPath('/app/workspace/deck-1/edit', 'en-US')).toBe('/app/workspace/deck-1/edit')
  })

  it('keeps relative path when switching language', () => {
    expect(relativeLangPath('/en/news/starter-release')).toBe('/news/starter-release')
    expect(getSwitchLanguageUrl('/en/pricing', 'zh-CN', '?plan=growth#faq')).toBe(
      '/pricing?plan=growth#faq'
    )
    expect(getSwitchLanguageUrl('/pricing', 'en-US')).toBe('/en/pricing')
    expect(getSwitchLanguageUrl('/app/workspace', 'en-US')).toBe('/app/workspace')
    expect(getSwitchLanguageUrl('/en/app/workspace', 'zh-CN')).toBe('/app/workspace')
  })
})
