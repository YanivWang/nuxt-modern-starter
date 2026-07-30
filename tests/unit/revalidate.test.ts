/*
  【文件职责】
    单测：SWR 缓存失效路径解析、路径白名单、缓存清除结果与 revalidate 鉴权工具。

  【架构位置】
    tests/unit — server/utils/revalidate.ts 纯函数。
*/
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SUPPORTED_LOCALES } from '../../config/site'
import {
  buildRouteCacheKey,
  getNewsRevalidatePaths,
  isRevalidatablePath,
  purgeRouteCaches,
  resolveRevalidatePaths
} from '../../server/utils/revalidate'
import {
  consumeRevalidateRateLimit,
  isAuthorizedRevalidateSecret,
  resetRevalidateRateLimitForTests
} from '../../server/api/revalidate.post'

const createCacheStorage = (items: Iterable<string>) => {
  const cacheKeys = new Set(items)

  return {
    hasItem: vi.fn(async (key: string) => cacheKeys.has(key)),
    removeItem: vi.fn(async (key: string) => {
      cacheKeys.delete(key)
    }),
    keys: () => [...cacheKeys]
  }
}

describe('revalidate helpers', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
    resetRevalidateRateLimitForTests()
  })

  it('builds stable cache keys for public news paths', () => {
    const first = buildRouteCacheKey('/news/starter-release')
    const second = buildRouteCacheKey('/news/starter-release')

    expect(first).toMatch(/^nitro\/routes:_:/)
    expect(first).toBe(second)
  })

  it('allows only configured SWR news routes to be revalidated', () => {
    expect(isRevalidatablePath('/news')).toBe(true)
    expect(isRevalidatablePath('/news/starter-release')).toBe(true)
    expect(isRevalidatablePath('/en/news/starter-release')).toBe(true)
    expect(isRevalidatablePath('/workspace')).toBe(false)
    expect(isRevalidatablePath('/docs/project_1')).toBe(false)
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

  it('reports purged and missed cache paths explicitly', async () => {
    const existingPath = '/news/starter-release'
    const missedPath = '/news/missing'
    const storage = createCacheStorage([buildRouteCacheKey(existingPath)])

    vi.stubGlobal(
      'useStorage',
      vi.fn(() => storage)
    )

    await expect(purgeRouteCaches([existingPath, missedPath])).resolves.toEqual({
      purged: [existingPath],
      missed: [missedPath]
    })
    expect(storage.keys()).toEqual([])
  })

  it('compares revalidate secrets through fixed-length digests', () => {
    expect(isAuthorizedRevalidateSecret('secret', 'secret')).toBe(true)
    expect(isAuthorizedRevalidateSecret('wrong', 'secret')).toBe(false)
    expect(isAuthorizedRevalidateSecret('short', 'much-longer-secret')).toBe(false)
  })

  it('limits revalidate attempts per source key', () => {
    for (let index = 0; index < 10; index += 1) {
      expect(consumeRevalidateRateLimit('127.0.0.1', 1_000)).toBe(true)
    }

    expect(consumeRevalidateRateLimit('127.0.0.1', 1_000)).toBe(false)
    expect(consumeRevalidateRateLimit('127.0.0.1', 61_001)).toBe(true)
  })
})
