/*
  【文件职责】
    SWR 路由缓存失效工具：校验可失效路径，按公开路径计算 Nitro cache key 并清除条目。

  【架构位置】
    server/utils — 被 server/api/revalidate.post.ts 消费。

  【边界与注意】
    routeRules SWR 使用 group `nitro/routes`；key 算法需与 Nitro cachedEventHandler 保持一致。
    哈希必须用 nitroCacheHash，不能用 ohash 的 hash()，原因见该函数注释。
    算法漂移由 tests/unit/revalidate-nitro-contract.test.ts 拦截。
*/
import { digest } from 'ohash'
import { parseURL } from 'ufo'
import { SUPPORTED_LOCALES } from '../../config/site'
import { localizedPath, swrRouteRules } from '../../config/routes'

const ROUTE_CACHE_GROUP = 'nitro/routes'
const ROUTE_CACHE_NAME = '_'

function escapeCacheKey(key: string) {
  return String(key).replace(/\W/g, '')
}

/**
 * 复刻 Nitro 的缓存 key 哈希（nitropack/dist/runtime/internal/hash.mjs）：
 *   digest(value).replace(/[-_]/g, '').slice(0, 10)
 *
 * 不能改用 ohash 的 hash()。对字符串输入，两者有两处不同：
 *   1. ohash.hash 会先 serialize 再 digest，Nitro 对字符串是直接 digest
 *   2. ohash.hash 返回完整摘要，Nitro 会去掉 -_ 并截断到 10 位
 * 用错的后果是静默的：算出的 key 永远匹配不到真实条目，
 * /api/revalidate 每次都报 "No matching SWR cache entries"，缓存实际从未被清除。
 */
function nitroCacheHash(value: string) {
  return digest(value).replace(/[-_]/g, '').slice(0, 10)
}

export function normalizeRevalidatePath(path: string) {
  const trimmed = path.trim()
  if (!trimmed) {
    return ''
  }

  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

const getPathname = (path: string) => parseURL(normalizeRevalidatePath(path)).pathname || '/'

const routeRuleMatchesPath = (rule: string, path: string) => {
  if (rule.endsWith('/**')) {
    const basePath = rule.slice(0, -3)
    return path === basePath || path.startsWith(`${basePath}/`)
  }

  return path === rule
}

export function isRevalidatablePath(path: string) {
  const normalizedPath = normalizeRevalidatePath(path)

  if (!normalizedPath) {
    return false
  }

  try {
    const pathname = getPathname(normalizedPath)
    return swrRouteRules.some((rule) => routeRuleMatchesPath(rule, pathname))
  } catch {
    return false
  }
}

export function buildRouteCacheKey(path: string) {
  const normalizedPath = normalizeRevalidatePath(path)
  let pathname: string

  try {
    pathname =
      escapeCacheKey(decodeURI(parseURL(normalizedPath).pathname || '')).slice(0, 16) || 'index'
  } catch {
    pathname = '-'
  }

  const hashedPath = `${pathname}.${nitroCacheHash(normalizedPath)}`
  return `${ROUTE_CACHE_GROUP}:${ROUTE_CACHE_NAME}:${hashedPath}.json`
}

export function getNewsRevalidatePaths(slug: string) {
  const normalizedSlug = slug.trim()

  // slug 快捷方式展开为 15 语言 ×（列表 + 详情）共 30 条新闻路径
  return SUPPORTED_LOCALES.flatMap((locale) => [
    localizedPath('/news', locale),
    localizedPath(`/news/${normalizedSlug}`, locale)
  ])
}

export async function purgeRouteCache(path: string) {
  const normalizedPath = normalizeRevalidatePath(path)

  if (!normalizedPath) {
    return false
  }

  const storage = useStorage('cache')
  const cacheKey = buildRouteCacheKey(normalizedPath)
  const existed = (await storage.hasItem(cacheKey)) ?? false
  await storage.removeItem(cacheKey)
  return existed
}

export async function purgeRouteCaches(paths: readonly string[]) {
  const normalizedPaths = [...new Set(paths.map(normalizeRevalidatePath).filter(Boolean))]
  const purged: string[] = []
  const missed: string[] = []

  for (const path of normalizedPaths) {
    const removed = await purgeRouteCache(path)
    if (removed) {
      purged.push(path)
    } else {
      missed.push(path)
    }
  }

  return {
    purged,
    missed
  }
}

export function resolveRevalidatePaths(body: unknown) {
  if (!body || typeof body !== 'object') {
    return []
  }

  const payload = body as { paths?: unknown; slug?: unknown }
  const paths = new Set<string>()

  if (Array.isArray(payload.paths)) {
    for (const path of payload.paths) {
      if (typeof path === 'string') {
        const normalized = normalizeRevalidatePath(path)
        if (normalized) {
          paths.add(normalized)
        }
      }
    }
  }

  if (typeof payload.slug === 'string' && payload.slug.trim()) {
    for (const path of getNewsRevalidatePaths(payload.slug)) {
      paths.add(path)
    }
  }

  return [...paths]
}
