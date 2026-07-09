/*
  【文件职责】
    受保护的 on-demand revalidation 入口：按 paths 或 slug 清除 SWR 页面缓存。

  【架构位置】
    server/api — 由 nuxt-modern-starter-api 在新闻变更后 webhook 调用。

  【边界与注意】
    使用 NUXT_REVALIDATE_SECRET 鉴权；未配置 secret 时返回 503。
*/
import { purgeRouteCaches, resolveRevalidatePaths } from '../utils/revalidate'

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

  // Header 缺失或与 runtimeConfig 不一致 → 401
  if (!providedSecret || providedSecret !== revalidateSecret) {
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

  const purged = await purgeRouteCaches(paths)

  return {
    requested: paths,
    purged
  }
})
