import { describe, expect, it } from 'vitest'
import { exLanguagePrefixByPath, matchRouteLanguage } from '../../i18n'
import { resolveLocaleRouteDecision } from '../../app/middleware/locale.global'

describe('locale routing decisions', () => {
  it('resolves default and non-default language prefixes', () => {
    expect(matchRouteLanguage()).toBe('zh-CN')
    expect(matchRouteLanguage('en')).toBe('en-US')
  })

  it('returns undefined for unsupported language-like prefixes', () => {
    expect(matchRouteLanguage('fr')).toBeUndefined()
    expect(exLanguagePrefixByPath('/fr/pricing')).toBeUndefined()
  })

  it('extracts supported language prefixes from paths', () => {
    expect(exLanguagePrefixByPath('/en/pricing')).toBe('en-US')
    expect(exLanguagePrefixByPath('/pricing')).toBeUndefined()
  })

  it('redirects default prefixes and trailing slashes with 301', () => {
    expect(resolveLocaleRouteDecision('/zh/pricing')).toEqual({
      type: 'redirect',
      path: '/pricing',
      redirectCode: 301
    })
    expect(resolveLocaleRouteDecision('/en/pricing/')).toEqual({
      type: 'redirect',
      path: '/en/pricing',
      redirectCode: 301
    })
  })

  it('redirects localized product URLs to language-neutral product URLs', () => {
    expect(resolveLocaleRouteDecision('/en/app/workspace')).toEqual({
      type: 'redirect',
      path: '/app/workspace',
      redirectCode: 301
    })
    expect(resolveLocaleRouteDecision('/en/app/workspace/deck-1/edit')).toEqual({
      type: 'redirect',
      path: '/app/workspace/deck-1/edit',
      redirectCode: 301
    })
  })

  it('returns a 404 decision for unsupported language prefixes', () => {
    expect(resolveLocaleRouteDecision('/fr/pricing')).toEqual({
      type: 'error',
      statusCode: 404,
      statusMessage: 'error.unsupportedLanguage'
    })
  })
})
