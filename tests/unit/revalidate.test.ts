/*
  【文件职责】
    单测：SWR 缓存失效路径解析与 Nitro cache key 生成。

  【架构位置】
    tests/unit — server/utils/revalidate.ts 纯函数。
*/
import { describe, expect, it } from 'vitest'
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
    expect(getNewsRevalidatePaths('starter-release')).toEqual([
      '/news',
      '/news/starter-release',
      '/en/news',
      '/en/news/starter-release'
    ])
  })

  it('resolves explicit paths and slug shortcuts from request body', () => {
    expect(
      resolveRevalidatePaths({
        paths: ['/news', '/en/news/foo'],
        slug: 'starter-release'
      })
    ).toEqual([
      '/news',
      '/en/news/foo',
      '/news/starter-release',
      '/en/news',
      '/en/news/starter-release'
    ])
  })
})
