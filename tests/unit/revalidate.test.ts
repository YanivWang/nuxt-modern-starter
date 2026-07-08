/*
  【文件职责】
    单测：SWR 缓存失效路径解析与 Nitro cache key 生成。

  【架构位置】
    tests/unit — server/utils/revalidate.ts 纯函数。
*/
import { describe, expect, it } from 'vitest'
import { SUPPORTED_LOCALES } from '../../config/site'
import {
  buildRouteCacheKey,
  getNewsRevalidatePaths,
  resolveRevalidatePaths
} from '../../server/utils/revalidate'

describe('revalidate helpers', () => {
  it('builds stable cache keys for public news paths', () => {
    const first = buildRouteCacheKey('/news/starter-release')
    const second = buildRouteCacheKey('/news/starter-release')

    expect(first).toMatch(/^nitro\/routes:_:/)
    expect(first).toBe(second)
  })

  it('expands slug into localized news paths', () => {
    const paths = getNewsRevalidatePaths('starter-release')

    expect(paths).toContain('/news')
    expect(paths).toContain('/news/starter-release')
    expect(paths).toContain('/en/news')
    expect(paths).toContain('/en/news/starter-release')
    expect(paths).toContain('/kr/news/starter-release')
    expect(paths).toHaveLength(SUPPORTED_LOCALES.length * 2)
  })

  it('resolves explicit paths and slug shortcuts from request body', () => {
    const resolved = resolveRevalidatePaths({
      paths: ['/news', '/en/news/foo'],
      slug: 'starter-release'
    })

    expect(resolved).toContain('/news')
    expect(resolved).toContain('/en/news/foo')
    expect(resolved).toContain('/news/starter-release')
    expect(resolved).toContain('/en/news/starter-release')
    expect(resolved).toHaveLength(SUPPORTED_LOCALES.length * 2 + 1)
  })
})
