import { describe, expect, it } from 'vitest'
import { exLanguagePrefixByPath, matcheRouteLanguage } from '../../i18n'

describe('locale routing decisions', () => {
  it('resolves default and non-default language prefixes', () => {
    expect(matcheRouteLanguage()).toBe('zh-CN')
    expect(matcheRouteLanguage('en')).toBe('en-US')
  })

  it('returns undefined for unsupported language-like prefixes', () => {
    expect(matcheRouteLanguage('fr')).toBeUndefined()
    expect(exLanguagePrefixByPath('/fr/pricing')).toBeUndefined()
  })

  it('extracts supported language prefixes from paths', () => {
    expect(exLanguagePrefixByPath('/en/pricing')).toBe('en-US')
    expect(exLanguagePrefixByPath('/pricing')).toBeUndefined()
  })
})
