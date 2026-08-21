/*
  【文件职责】
    单测：publicLocalizedPaths 从 PUBLIC_PAGE_PATHS 展开多语言 SEO 路径；
    prerender / SWR 规则从单一来源展开，且每条 SWR 路径同时覆盖裸路径与子树。

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
    SWR 断言锁的是「裸路径 + 子树」成对出现：Nitro 把 swr 规则注册成独立 handler，
    h3 router 的 '/x/**' 不匹配 '/x'，漏掉裸路径会让列表页静默失去缓存。
*/
import { describe, expect, it } from 'vitest'
import { PUBLIC_PAGE_PATHS, SUPPORTED_LOCALES } from '../../config/site'
import {
  PRERENDER_BASE_PATHS,
  PRERENDER_LOCALES,
  SWR_BASE_PATHS,
  localizedPath,
  prerenderRoutes,
  publicLocalizedPaths,
  swrRouteRules
} from '../../config/routes'

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

  it('prerenders the marketing pages of the primary markets only', () => {
    expect(prerenderRoutes).toEqual(['/', '/about', '/help', '/en', '/en/about', '/en/help'])
    expect(prerenderRoutes).toHaveLength(PRERENDER_BASE_PATHS.length * PRERENDER_LOCALES.length)
  })
})

describe('SWR route rules', () => {
  it('covers both the bare path and the subtree for every locale', () => {
    for (const locale of SUPPORTED_LOCALES) {
      for (const basePath of SWR_BASE_PATHS) {
        const localized = localizedPath(basePath, locale)

        // 缺了裸路径，列表页会落到未缓存的 '/**' handler 且没有任何报错
        expect(swrRouteRules).toContain(localized)
        expect(swrRouteRules).toContain(`${localized}/**`)
      }
    }
  })

  it('has no rule outside the declared base paths', () => {
    const allowed = new Set(
      SUPPORTED_LOCALES.flatMap((locale) =>
        SWR_BASE_PATHS.flatMap((basePath) => {
          const localized = localizedPath(basePath, locale)
          return [localized, `${localized}/**`]
        })
      )
    )

    expect(swrRouteRules.filter((rule) => !allowed.has(rule))).toEqual([])
    expect(swrRouteRules).toHaveLength(allowed.size)
  })
})
