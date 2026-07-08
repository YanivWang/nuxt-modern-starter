/*
  【文件职责】
    单测：localizedPath、getSwitchLanguageUrl 公开页前缀与产品 path 语言中性。

  【架构位置】
    tests/unit — config/routes + i18n helper。

  【主要导出 / 路由】
    describe locale path utilities

  【依赖关系】
    - 依赖：config/routes.ts、i18n/index.ts
    - mock：无

  【渲染 / 数据】
    无

  【边界与注意】
    不覆盖 useLocalePath composable；不测 middleware 301。
*/
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
    expect(localizedPath('/workspace', 'en-US')).toBe('/workspace')
    expect(localizedPath('/docs/deck-1', 'en-US')).toBe('/docs/deck-1')
    expect(localizedPath('/account', 'en-US')).toBe('/account')
  })

  it('keeps relative path when switching language', () => {
    expect(relativeLangPath('/en/news/starter-release')).toBe('/news/starter-release')
    expect(getSwitchLanguageUrl('/en/pricing', 'zh-CN', '?plan=growth#faq')).toBe(
      '/pricing?plan=growth#faq'
    )
    expect(getSwitchLanguageUrl('https://example.com/en/pricing?plan=growth#faq', 'zh-CN')).toBe(
      '/pricing?plan=growth#faq'
    )
    expect(getSwitchLanguageUrl('/pricing', 'en-US')).toBe('/en/pricing')
    expect(getSwitchLanguageUrl('/workspace', 'en-US')).toBe('/workspace')
    expect(getSwitchLanguageUrl('/en/workspace', 'zh-CN')).toBe('/workspace')
  })
})
