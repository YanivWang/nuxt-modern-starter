/*
  【文件职责】
    契约测试：锁住 server/utils/revalidate.ts 复刻的 Nitro cache key 算法与已安装 nitropack 一致。
    从 nitropack 源码提取真实算法与常量执行比对，Nitro 升级导致算法漂移时本测试必须失败。

  【架构位置】
    tests/unit — 读 node_modules/nitropack 源码 + unstorage 内存实例，无需起服务器。

  【主要导出 / 路由】
    describe nitro cache key contract

  【依赖关系】
    - 依赖：nitropack runtime/internal/cache.mjs 与 internal/app.mjs、unstorage、ohash、ufo
    - 被测：server/utils/revalidate.ts::buildRouteCacheKey、purgeRouteCache
    - mock：useStorage 用 unstorage 内存实例替身

  【渲染 / 数据】
    无

  【边界与注意】
    🔴 本测试的意义是「我们的拷贝 == Nitro 装的那份」。
    若 nitropack 改了 escapeKey / slice(0,16) / group / base / hash，提取会失败或 key 不等，两种都必须红。
    不要把它降级成只断言前缀 —— 那正是本测试要取代的东西。
    🔴 哈希也必须从 nitropack 源码提取。曾经这里直接调用 ohash 的 hash()，
    与被测代码是同一个调用 —— 两边用同一个错误实现互相印证，
    导致 /api/revalidate 实际从未清除过任何条目，测试却一直是绿的。
*/
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { digest } from 'ohash'
import { parseURL } from 'ufo'
import { createStorage, prefixStorage } from 'unstorage'
import memoryDriver from 'unstorage/drivers/memory'
import { describe, expect, it, vi } from 'vitest'
import { buildRouteCacheKey, purgeRouteCaches } from '../../server/utils/revalidate'

const projectRoot = resolve(__dirname, '../..')
const readNitroSource = (fileName: string) =>
  readFileSync(
    resolve(projectRoot, 'node_modules/nitropack/dist/runtime/internal', fileName),
    'utf8'
  )

const cacheSource = readNitroSource('cache.mjs')
const appSource = readNitroSource('app.mjs')
const hashSource = readNitroSource('hash.mjs')

/** 从 nitropack 源码提取真实实现，提取不到即视为契约漂移 */
const extract = (source: string, pattern: RegExp, label: string) => {
  const matched = source.match(pattern)
  if (!matched?.[1]) {
    throw new Error(
      `无法从 nitropack 源码提取 ${label} —— Nitro 可能已改实现，请重新核对 server/utils/revalidate.ts`
    )
  }
  return matched[1]
}

// escapeKey：Nitro 用它清洗 pathname
const nitroEscapeBody = extract(
  cacheSource,
  /function escapeKey\(key\)\s*\{\s*return ([^;]+);/,
  'escapeKey'
)
// pathname 截断长度：Nitro 的 .slice(0, N)
const nitroPathnameSlice = Number(
  extract(
    cacheSource,
    /escapeKey\(decodeURI\(parseURL\(_path\)\.pathname\)\)\.slice\(0,\s*(\d+)\)/,
    'pathname slice'
  )
)
// 路由缓存的 group / name / base
const nitroRouteGroup = extract(appSource, /group:\s*"([^"]+)"/, 'route cache group')
const nitroCacheName = extract(cacheSource, /return\s*\{\s*name:\s*"([^"]+)"/, 'default cache name')
const nitroCacheBase = extract(cacheSource, /base:\s*"([^"]+)"/, 'default cache base')

const nitroEscapeKey = new Function('key', `return ${nitroEscapeBody}`) as (key: string) => string

// hash：Nitro 用它生成 key 的哈希段。必须从源码提取执行，
// 直接 import ohash 的 hash() 会与被测代码犯同一个错误而无法发现漂移。
const nitroHashBody = extract(
  hashSource,
  /export function hash\(value\)\s*\{\s*return ([^;]+);/,
  'cache key hash'
)

const nitroHash = new Function('digest', 'serialize', `return (value) => ${nitroHashBody}`)(
  digest,
  () => {
    // 本测试只喂字符串路径；走到 serialize 说明 Nitro 改了实现，必须显式失败
    throw new Error('Nitro 的 hash 对字符串走了 serialize 分支，请重新核对 revalidate.ts')
  }
) as (value: string) => string

/** 完全按 Nitro 的 getKey + defineCachedFunction 组装 root storage key */
const nitroRootCacheKey = (path: string) => {
  let pathname: string
  try {
    pathname =
      nitroEscapeKey(decodeURI(parseURL(path).pathname)).slice(0, nitroPathnameSlice) || 'index'
  } catch {
    pathname = '-'
  }
  const hashedPath = `${pathname}.${nitroHash(path)}`
  return [nitroCacheBase, nitroRouteGroup, nitroCacheName, `${hashedPath}.json`]
    .filter(Boolean)
    .join(':')
    .replace(/:\/$/, ':index')
}

const samplePaths = ['/news', '/news/starter-release', '/en/news', '/kr/news/starter-release']

describe('nitro cache key contract', () => {
  it('pins the constants copied from nitropack', () => {
    expect(nitroRouteGroup).toBe('nitro/routes')
    expect(nitroCacheName).toBe('_')
    expect(nitroCacheBase).toBe('/cache')
    expect(nitroPathnameSlice).toBe(16)
    expect(nitroEscapeKey('/news/starter-release')).toBe('newsstarterrelease')
    // 哈希段固定 10 位、不含 - 与 _；ohash 的 hash() 返回的是完整摘要，长度与字符集都不同
    expect(nitroHash('/news')).toHaveLength(10)
    expect(nitroHash('/news')).toMatch(/^[A-Za-z0-9]{10}$/)
  })

  it('resolves to the exact entry Nitro would write, through unstorage normalization', async () => {
    for (const path of samplePaths) {
      // 1. 用 Nitro 的算法在 root storage 上写入条目（模拟 SWR 命中后落盘）
      const storage = createStorage({ driver: memoryDriver() })
      await storage.setItem(nitroRootCacheKey(path), { value: 'cached' })

      // 2. 用项目自己的 key，经 useStorage('cache') 前缀视图去清除
      const cacheView = prefixStorage(storage, 'cache')
      vi.stubGlobal(
        'useStorage',
        vi.fn(() => cacheView)
      )

      const ourKey = buildRouteCacheKey(path)
      await expect(
        cacheView.hasItem(ourKey),
        `${path} 的 key 未命中 Nitro 写入的条目`
      ).resolves.toBe(true)

      // 3. 端到端：purge 后条目必须消失
      await expect(purgeRouteCaches([path])).resolves.toEqual({ purged: [path], missed: [] })
      await expect(cacheView.hasItem(ourKey)).resolves.toBe(false)
      expect(await storage.getKeys()).toEqual([])

      vi.unstubAllGlobals()
    }
  })

  it('reports a miss instead of silently succeeding when the key does not match', async () => {
    const storage = createStorage({ driver: memoryDriver() })
    const cacheView = prefixStorage(storage, 'cache')
    vi.stubGlobal(
      'useStorage',
      vi.fn(() => cacheView)
    )

    await expect(purgeRouteCaches(['/news/never-cached'])).resolves.toEqual({
      purged: [],
      missed: ['/news/never-cached']
    })

    vi.unstubAllGlobals()
  })
})
