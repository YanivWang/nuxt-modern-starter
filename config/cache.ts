/*
  【文件职责】
    SWR / ISR 页面缓存的存储驱动配置。默认进程内存；多实例部署需换共享驱动。

  【架构位置】
    config 层 — 被 nuxt.config.ts 的 nitro.storage 消费。

  【主要导出 / 路由】
    CACHE_DRIVERS、resolveCacheStorage

  【依赖关系】
    - 依赖：无（仅读 process.env）
    - 被引用：nuxt.config.ts、tests/unit/cache-storage.test.ts

  【渲染 / 数据】
    构建期求值：驱动选择写进 .output，运行时不再变化。

  【边界与注意】
    默认 memory 时缓存按进程隔离：POST /api/revalidate 只会清掉收到请求的那个进程，
    其余进程继续发陈旧 HTML 直到 TTL 到期。单进程部署没问题；一旦横向扩容（多进程 /
    多容器），必须设 NUXT_CACHE_DRIVER=fs（同机共享卷）或自行接入 redis 等共享驱动。
    新增驱动需同步 tests/unit/cache-storage.test.ts 与 docs-site/deployment/overview.md。
*/

/** 内置可选驱动；redis 等需要额外依赖的驱动由使用方自行接入 */
export const CACHE_DRIVERS = ['memory', 'fs'] as const

export type CacheDriver = (typeof CACHE_DRIVERS)[number]

export const DEFAULT_CACHE_FS_BASE = './.data/cache'

export const isCacheDriver = (value: string): value is CacheDriver =>
  CACHE_DRIVERS.includes(value as CacheDriver)

/**
 * 解析 nitro.storage 片段。
 * 返回空对象表示保持 Nitro 默认（进程内存），不引入任何额外依赖。
 */
export const resolveCacheStorage = (env: NodeJS.ProcessEnv = process.env) => {
  const driver = env.NUXT_CACHE_DRIVER || 'memory'

  if (!isCacheDriver(driver)) {
    throw new Error(
      `NUXT_CACHE_DRIVER "${driver}" 不受支持，可选值：${CACHE_DRIVERS.join(' | ')}。` +
        '要接入 redis 等共享驱动，请在 nuxt.config.ts 的 nitro.storage.cache 里直接配置。'
    )
  }

  if (driver === 'memory') {
    return {}
  }

  return {
    cache: {
      driver: 'fsLite',
      base: env.NUXT_CACHE_FS_BASE || DEFAULT_CACHE_FS_BASE
    }
  }
}
