/*
  【文件职责】
    受保护的 on-demand revalidation 入口：按 paths 或 slug 清除 SWR 页面缓存。

  【架构位置】
    server/api — 由 nuxt-modern-starter-api 在新闻变更后 webhook 调用。

  【边界与注意】
    使用 NUXT_REVALIDATE_SECRET 鉴权；未配置 secret 时返回 503。
    限流复用 server/utils/rate-limit.ts 的单实例内存限流器（10 次 / 分钟），
    多实例部署需在网关层补共享限流。
*/
import { createHash, timingSafeEqual } from 'node:crypto'
import {
  createError,
  defineEventHandler,
  getHeader,
  getRequestIP,
  readBody,
  setResponseStatus
} from 'h3'
import { isRevalidatablePath, purgeRouteCaches, resolveRevalidatePaths } from '../utils/revalidate'
import { createRateLimiter } from '../utils/rate-limit'

const REVALIDATE_RATE_LIMIT_WINDOW_MS = 60_000
const REVALIDATE_RATE_LIMIT_MAX = 10

const rateLimiter = createRateLimiter({
  windowMs: REVALIDATE_RATE_LIMIT_WINDOW_MS,
  max: REVALIDATE_RATE_LIMIT_MAX
})

const digestSecret = (secret: string) => createHash('sha256').update(secret).digest()

export const isAuthorizedRevalidateSecret = (providedSecret: string, expectedSecret: string) =>
  timingSafeEqual(digestSecret(providedSecret), digestSecret(expectedSecret))

export const consumeRevalidateRateLimit = (key: string, now = Date.now()) =>
  rateLimiter.consume(key, now)

export const resetRevalidateRateLimitForTests = () => {
  rateLimiter.reset()
}

const getRateLimitKey = (event: Parameters<typeof getRequestIP>[0]) =>
  getRequestIP(event, { xForwardedFor: true }) || 'unknown'

export default defineEventHandler(async (event) => {
  const { revalidateSecret } = useRuntimeConfig()

  // 未配置 NUXT_REVALIDATE_SECRET 时拒绝服务，避免无鉴权缓存清除
  if (!revalidateSecret) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Revalidation is not configured'
    })
  }

  const providedSecret = getHeader(event, 'x-revalidate-secret')
  const rateLimitKey = getRateLimitKey(event)

  if (!consumeRevalidateRateLimit(rateLimitKey)) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too Many Requests'
    })
  }

  // Header 缺失或与 runtimeConfig 不一致 → 401
  if (!providedSecret || !isAuthorizedRevalidateSecret(providedSecret, revalidateSecret)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  const body = await readBody(event)
  const paths = resolveRevalidatePaths(body)

  if (paths.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'paths or slug is required'
    })
  }

  const blockedPaths = paths.filter((path) => !isRevalidatablePath(path))

  if (blockedPaths.length > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: `Non-revalidatable paths: ${blockedPaths.join(', ')}`
    })
  }

  const { purged, missed } = await purgeRouteCaches(paths)

  if (missed.length === paths.length) {
    throw createError({
      statusCode: 500,
      statusMessage: `No matching SWR cache entries: ${missed.join(', ')}`
    })
  }

  if (missed.length > 0) {
    setResponseStatus(event, 207, 'Multi-Status')
  }

  return {
    requested: paths,
    purged,
    missed
  }
})
