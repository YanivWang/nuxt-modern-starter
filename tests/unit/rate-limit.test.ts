/*
  【文件职责】
    单测：createRateLimiter 的窗口计数、窗口重置与过期条目清理。

  【架构位置】
    tests/unit — server/utils/rate-limit.ts，纯函数，无 Nuxt 运行时。

  【主要导出 / 路由】
    describe createRateLimiter

  【依赖关系】
    - 依赖：server/utils/rate-limit.ts
    - mock：无（now 由参数注入，不用假时钟）

  【渲染 / 数据】
    无

  【边界与注意】
    限流按进程计数；本文件不覆盖多实例语义，那是网关层职责。
*/
import { describe, expect, it } from 'vitest'
import { createRateLimiter } from '../../server/utils/rate-limit'

describe('createRateLimiter', () => {
  it('allows up to max requests inside one window', () => {
    const limiter = createRateLimiter({ windowMs: 1000, max: 3 })

    expect([1, 2, 3].map(() => limiter.consume('ip', 0))).toEqual([true, true, true])
    expect(limiter.consume('ip', 0)).toBe(false)
  })

  it('counts each key independently', () => {
    const limiter = createRateLimiter({ windowMs: 1000, max: 1 })

    expect(limiter.consume('a', 0)).toBe(true)
    expect(limiter.consume('b', 0)).toBe(true)
    expect(limiter.consume('a', 0)).toBe(false)
  })

  it('starts a fresh window once the old one expires', () => {
    const limiter = createRateLimiter({ windowMs: 1000, max: 1 })

    expect(limiter.consume('ip', 0)).toBe(true)
    expect(limiter.consume('ip', 999)).toBe(false)
    expect(limiter.consume('ip', 1000)).toBe(true)
  })

  it('evicts expired buckets so long-running processes do not leak keys', () => {
    const limiter = createRateLimiter({ windowMs: 1000, max: 5 })

    for (let i = 0; i < 50; i += 1) {
      limiter.consume(`ip-${i}`, 0)
    }
    expect(limiter.size()).toBe(50)

    // 新窗口里的一次 consume 会顺带清掉全部过期 bucket
    limiter.consume('ip-fresh', 5000)
    expect(limiter.size()).toBe(1)
  })

  it('can be reset for test isolation', () => {
    const limiter = createRateLimiter({ windowMs: 1000, max: 1 })

    limiter.consume('ip', 0)
    limiter.reset()

    expect(limiter.consume('ip', 0)).toBe(true)
  })
})
