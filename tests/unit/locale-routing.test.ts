/*
  【文件职责】
    单测：app/middleware/locale.global.ts 路由决策与 i18n 前缀解析。
    覆盖 /zh 301、尾斜杠、产品 URL canonical、不支持语言 404。

  【架构位置】
    tests/unit — 纯函数，无 Nuxt 运行时 mock。

  【主要导出 / 路由】
    describe locale routing decisions

  【依赖关系】
    - 依赖：i18n/index.ts、app/middleware/locale.global.ts
    - mock：无

  【渲染 / 数据】
    无

  【边界与注意】
    不覆盖 middleware 内 loadLocaleMessages / navigateTo；修改决策树须同步本文件。
*/
import { describe, expect, it } from 'vitest'
import { extractLanguagePrefixByPath, localeFromPrefix, resolvePreferredLocale } from '../../i18n'
import { resolveLocaleRouteDecision } from '../../app/middleware/locale.global'

describe('locale routing decisions', () => {
  it('resolves default and non-default language prefixes', () => {
    expect(resolvePreferredLocale('/')).toBe('zh-CN')
    expect(resolvePreferredLocale('/en/pricing')).toBe('en-US')
    expect(resolvePreferredLocale('/kr/pricing')).toBe('ko-KR')
    expect(resolvePreferredLocale('/zh-hk/help')).toBe('zh-HK')
  })

  it('returns undefined for unsupported language-like prefixes', () => {
    expect(localeFromPrefix('xx')).toBeUndefined()
  })

  it('extracts supported language prefixes from paths', () => {
    expect(localeFromPrefix('en')).toBe('en-US')
    expect(localeFromPrefix('jp')).toBe('ja-JP')
    expect(localeFromPrefix(undefined)).toBeUndefined()
    expect(extractLanguagePrefixByPath('/en/pricing')).toBe('en')
    expect(extractLanguagePrefixByPath('/zh-hk/help')).toBe('zh-hk')
    expect(extractLanguagePrefixByPath('/workspace')).toBe('')
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
    expect(resolveLocaleRouteDecision('/en/workspace')).toEqual({
      type: 'redirect',
      path: '/workspace',
      redirectCode: 301
    })
    expect(resolveLocaleRouteDecision('/en/docs/deck-1')).toEqual({
      type: 'redirect',
      path: '/docs/deck-1',
      redirectCode: 301
    })
    expect(resolveLocaleRouteDecision('/en/account')).toEqual({
      type: 'redirect',
      path: '/account',
      redirectCode: 301
    })
    expect(resolveLocaleRouteDecision('/kr/workspace')).toEqual({
      type: 'redirect',
      path: '/workspace',
      redirectCode: 301
    })
  })

  it('returns a 404 decision for unsupported language prefixes', () => {
    expect(resolveLocaleRouteDecision('/xx/pricing')).toEqual({
      type: 'error',
      statusCode: 404,
      statusMessage: 'error.unsupportedLanguage'
    })
  })

  it('resolves newly added public language prefixes', () => {
    expect(resolveLocaleRouteDecision('/fr/pricing')).toEqual({
      type: 'locale',
      locale: 'fr-FR'
    })
    expect(resolveLocaleRouteDecision('/pt-br/about')).toEqual({
      type: 'locale',
      locale: 'pt-BR'
    })
  })

  it('prefers the persisted locale for language-neutral product routes', () => {
    expect(resolveLocaleRouteDecision('/workspace', 'en-US')).toEqual({
      type: 'locale',
      locale: 'en-US'
    })
    expect(resolveLocaleRouteDecision('/docs/deck-1', 'fr-FR')).toEqual({
      type: 'locale',
      locale: 'fr-FR'
    })
    expect(resolveLocaleRouteDecision('/account', 'pt-BR')).toEqual({
      type: 'locale',
      locale: 'pt-BR'
    })
  })
})
