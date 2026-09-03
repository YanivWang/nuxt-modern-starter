/*
  【文件职责】
    单实例内存滑动窗口限流器：按 key 计数，窗口到期自动重置。
    由 server/api/revalidate.post.ts 与 server/api/telemetry/errors.post.ts 共用。

  【架构位置】
    server/utils — 无状态工具 + 每个调用方各自持有的 bucket Map。

  【主要导出 / 路由】
    createRateLimiter、RateLimiter、RateLimitOptions、DEFAULT_RATE_LIMIT_MAX_KEYS

  【依赖关系】
    - 依赖：无
    - 被引用：server/api/revalidate.post.ts、server/api/telemetry/errors.post.ts、
      tests/unit/rate-limit.test.ts

  【渲染 / 数据】
    进程内内存，无持久化。

  【边界与注意】
    计数按进程隔离 —— 横向扩容后每个实例各有一份配额，真实上限是 N × max。
    需要精确全局限流时应在网关层（见 docker/nginx/gateway.docker.conf）补 limit_req。

    key 数量必须有硬上限。key 来自请求方（客户端 IP），公开端点上它就是**攻击面**：
    没有上限时，换一批 key 就能把 Map 撑到吃光内存；而「每次新 key 都全表扫一遍过期项」
    还会让这件事变成 O(n²) —— 本来用来防刷的组件，反倒成了最省力的打法。
    因此清理只在接近上限时触发，清完仍然满就按插入顺序淘汰最旧的 key。
    淘汰而不是拒绝：满了就拒绝的话，灌 key 的一方顺手就把正常用户一起挡在了外面。
*/
/** 同时跟踪的 key 上限；每个 bucket 只有两个数字，1 万个 key 约占几百 KB */
export const DEFAULT_RATE_LIMIT_MAX_KEYS = 10_000

export type RateLimitOptions = {
  /** 窗口长度（毫秒） */
  windowMs: number
  /** 单窗口内允许的最大次数 */
  max: number
  /** 同时跟踪的 key 上限，默认 DEFAULT_RATE_LIMIT_MAX_KEYS */
  maxKeys?: number
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

export const createRateLimiter = ({
  windowMs,
  max,
  maxKeys = DEFAULT_RATE_LIMIT_MAX_KEYS
}: RateLimitOptions): RateLimiter => {
  const buckets = new Map<string, Bucket>()

  // 惰性清理：只在 consume 时扫描，避免为限流器单独挂一个常驻定时器
  const evictExpired = (now: number) => {
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) {
        buckets.delete(key)
      }
    }
  }

  // 定期清扫的下次时间点
  let nextSweepAt = 0

  /**
   * 全表扫描每个窗口至多一次，摊到每个请求是 O(1)。
   * 原来是「每来一个新 key 就扫一遍」，即 O(n²)，而 n 由请求方决定 —— 那正是要防的那件事。
   */
  const sweep = (now: number) => {
    if (now < nextSweepAt) {
      return
    }

    evictExpired(now)
    nextSweepAt = now + windowMs
  }

  const makeRoom = (now: number) => {
    sweep(now)

    // 清扫过后仍然到顶，说明这一窗口内的活跃 key 已超上限：
    // Map 按插入顺序迭代，淘汰队首（最久没有开启新窗口的那个）给新 key 让位。
    // 这里不再补一次 evictExpired —— 满表时逐请求全扫又会把 O(n²) 请回来。
    while (buckets.size >= maxKeys) {
      const oldest = buckets.keys().next().value

      if (oldest === undefined) {
        return
      }

      buckets.delete(oldest)
    }
  }

  const startWindow = (key: string, now: number) => {
    makeRoom(now)
    // 先删再写：让续期的 key 回到队尾，淘汰时才轮得到真正最久没动过的那些
    buckets.delete(key)
    buckets.set(key, { count: 1, resetAt: now + windowMs })
  }

  return {
    consume: (key: string, now = Date.now()) => {
      const bucket = buckets.get(key)

      if (!bucket || bucket.resetAt <= now) {
        startWindow(key, now)
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
