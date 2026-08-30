/*
  【文件职责】
    单实例内存滑动窗口限流器：按 key 计数，窗口到期自动重置。
    由 server/api/revalidate.post.ts 与 server/api/telemetry/errors.post.ts 共用。

  【架构位置】
    server/utils — 无状态工具 + 每个调用方各自持有的 bucket Map。

  【主要导出 / 路由】
    createRateLimiter、RateLimiter、RateLimitOptions

  【依赖关系】
    - 依赖：无
    - 被引用：server/api/revalidate.post.ts、server/api/telemetry/errors.post.ts、
      tests/unit/rate-limit.test.ts

  【渲染 / 数据】
    进程内内存，无持久化。

  【边界与注意】
    计数按进程隔离 —— 横向扩容后每个实例各有一份配额，真实上限是 N × max。
    需要精确全局限流时应在网关层（见 docker/nginx/gateway.docker.conf）补 limit_req。
    过期 bucket 在每次 consume 时顺带清理，避免长时间运行后 key 无限增长。
*/
export type RateLimitOptions = {
  /** 窗口长度（毫秒） */
  windowMs: number
  /** 单窗口内允许的最大次数 */
  max: number
}

export type RateLimiter = {
  /** 返回 true 表示放行并已计数；false 表示超出配额 */
  consume: (key: string, now?: number) => boolean
  reset: () => void
  size: () => number
}

type Bucket = {
  count: number
  resetAt: number
}

export const createRateLimiter = ({ windowMs, max }: RateLimitOptions): RateLimiter => {
  const buckets = new Map<string, Bucket>()

  // 惰性清理：只在 consume 时扫描，避免为限流器单独挂一个常驻定时器
  const evictExpired = (now: number) => {
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) {
        buckets.delete(key)
      }
    }
  }

  return {
    consume: (key: string, now = Date.now()) => {
      const bucket = buckets.get(key)

      if (!bucket || bucket.resetAt <= now) {
        evictExpired(now)
        buckets.set(key, { count: 1, resetAt: now + windowMs })
        return true
      }

      if (bucket.count >= max) {
        return false
      }

      bucket.count += 1
      return true
    },
    reset: () => buckets.clear(),
    size: () => buckets.size
  }
}
