/*
  【文件职责】
    单测：publicLocalizedPaths 从 PUBLIC_PAGE_PATHS 展开多语言 SEO 路径。

  【架构位置】
    tests/unit — config 层。

  【主要导出 / 路由】
    describe public SEO routes

  【依赖关系】
    - 依赖：config/site.ts、config/routes.ts
    - mock：无

  【渲染 / 数据】
    无

  【边界与注意】
    不覆盖 sitemap 动态 news slug；不含 sign-in/sign-up。
*/
import { describe, expect, it } from 'vitest'
import { PUBLIC_PAGE_PATHS, SUPPORTED_LOCALES } from '../../config/site'
import { publicLocalizedPaths } from '../../config/routes'

describe('public SEO routes', () => {
  it('generates localized public paths from the public page list', () => {
    const paths = publicLocalizedPaths()

    expect(paths).toContain('/')
    expect(paths).toContain('/pricing')
    expect(paths).toContain('/help')
    expect(paths).toContain('/about')
    expect(paths).toContain('/news')
    expect(paths).toContain('/en')
    expect(paths).toContain('/en/pricing')
    expect(paths).toContain('/en/about')
    expect(paths).toContain('/en/help')
    expect(paths).toContain('/en/news')
    expect(paths).toHaveLength(PUBLIC_PAGE_PATHS.length * SUPPORTED_LOCALES.length)
  })
})
