/*
  【文件职责】
    SWR 路由缓存失效工具：按公开路径计算 Nitro cache key 并清除条目。

  【架构位置】
    server/utils — 被 server/api/revalidate.post.ts 消费。

  【边界与注意】
    routeRules SWR 使用 group `nitro/routes`；key 算法需与 Nitro cachedEventHandler 保持一致。
*/
import { hash } from 'ohash'
import { parseURL } from 'ufo'
import { SUPPORTED_LOCALES } from '../../config/site'
import { localizedPath } from '../../config/routes'

const ROUTE_CACHE_GROUP = 'nitro/routes'
const ROUTE_CACHE_NAME = '_'

function escapeCacheKey(key: string) {
  return String(key).replace(/\W/g, '')
}

export function normalizeRevalidatePath(path: string) {
  const trimmed = path.trim()
  if (!trimmed) {
    return ''
  }

  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
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

  const hashedPath = `${pathname}.${hash(normalizedPath)}`
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

  for (const path of normalizedPaths) {
    const removed = await purgeRouteCache(path)
    if (removed) {
      purged.push(path)
    }
  }

  return purged
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
