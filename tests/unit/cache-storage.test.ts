/*
  【文件职责】
    单测：SWR 页面缓存的存储驱动解析，以及「默认按进程隔离」这一约束被显式声明。

  【架构位置】
    tests/unit — 纯函数 + 读盘静态检查，无运行时。

  【主要导出 / 路由】
    describe cache storage driver

  【依赖关系】
    - 依赖：config/cache.ts、nuxt.config.ts、docs-site/deployment/overview.md
    - mock：无

  【渲染 / 数据】
    无 — resolveCacheStorage 在构建期求值，结果写进 .output。

  【边界与注意】
    实测依据（Nuxt 4.4.8 / Nitro 2.13.4）：默认内存驱动下，两个进程各自持有缓存，
    向其中一个 POST /api/revalidate 后另一个继续发陈旧 HTML；
    改用共享 fs 驱动后，purge 会让两个进程同时失效。
*/
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  CACHE_DRIVERS,
  DEFAULT_CACHE_FS_BASE,
  isCacheDriver,
  resolveCacheStorage
} from '../../config/cache'

const projectRoot = resolve(__dirname, '../..')
const read = (rel: string) => readFileSync(resolve(projectRoot, rel), 'utf8')

describe('cache storage driver', () => {
  it('keeps Nitro defaults when no driver is configured', () => {
    // 空对象 = 不挂载 cache，沿用 Nitro 的进程内存驱动，不引入任何额外依赖
    expect(resolveCacheStorage({})).toEqual({})
    expect(resolveCacheStorage({ NUXT_CACHE_DRIVER: 'memory' })).toEqual({})
  })

  it('mounts a shared filesystem driver when asked', () => {
    expect(resolveCacheStorage({ NUXT_CACHE_DRIVER: 'fs' })).toEqual({
      cache: { driver: 'fsLite', base: DEFAULT_CACHE_FS_BASE }
    })
    expect(
      resolveCacheStorage({ NUXT_CACHE_DRIVER: 'fs', NUXT_CACHE_FS_BASE: '/mnt/cache' })
    ).toEqual({ cache: { driver: 'fsLite', base: '/mnt/cache' } })
  })

  it('fails loudly on an unknown driver instead of silently falling back', () => {
    // 静默回退到内存 = 以为配了共享缓存、实际没配，是最危险的失败方式
    expect(() => resolveCacheStorage({ NUXT_CACHE_DRIVER: 'redis' })).toThrow(/不受支持/)
    expect(isCacheDriver('redis')).toBe(false)
    expect(CACHE_DRIVERS).toEqual(['memory', 'fs'])
  })
})

describe('the per-process cache constraint stays documented', () => {
  it('wires nitro.storage from the single source', () => {
    const config = read('nuxt.config.ts')
    expect(config).toContain("from './config/cache'")
    expect(config).toMatch(/storage:\s*resolveCacheStorage\(\)/)
  })

  it('warns about multi-instance deployments where it matters', () => {
    // 这条约束只在部署形态改变时才咬人，代码里看不出来 —— 必须写在部署文档里
    expect(read('docs-site/deployment/overview.md')).toContain('NUXT_CACHE_DRIVER')
    expect(read('config/cache.ts')).toContain('NUXT_CACHE_DRIVER=fs')
  })
})
