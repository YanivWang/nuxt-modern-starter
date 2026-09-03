/*
  【文件职责】
    单测：客户端 IP 解析 —— 可信代理层数如何决定从 x-forwarded-for 的哪一项取值。

  【架构位置】
    tests/unit — server/utils/client-ip.ts 与 config/observability.ts 的纯函数，无 Nuxt 运行时。

  【主要导出 / 路由】
    describe resolveClientIp / resolveTrustedProxyDepth

  【依赖关系】
    - 依赖：server/utils/client-ip.ts、config/observability.ts
    - mock：无（depth 由参数注入）

  【渲染 / 数据】
    无

  【边界与注意】
    这里守的是限流 key 不可被请求头伪造。
    取错一项不会有任何报错 —— 限流照常「工作」，只是攻击者每换一个伪造 IP 就重开一份配额。
*/
import { describe, expect, it } from 'vitest'
import { resolveTrustedProxyDepth } from '../../config/observability'
import { resolveClientIp } from '../../server/utils/client-ip'

const CONNECTION = '10.0.0.9'

describe('resolveClientIp', () => {
  it('ignores x-forwarded-for entirely when no proxy is trusted', () => {
    expect(resolveClientIp('1.2.3.4', CONNECTION, 0)).toBe(CONNECTION)
  })

  it('takes the hop the trusted proxy appended, not the client-supplied one', () => {
    // nginx 的 $proxy_add_x_forwarded_for 往右追加真实来源：
    // 客户端伪造了 1.2.3.4，网关在其后追加了它看到的真实地址
    expect(resolveClientIp('1.2.3.4, 203.0.113.7', CONNECTION, 1)).toBe('203.0.113.7')
    // 没有伪造时头里只有一项，取到的还是同一个真实地址
    expect(resolveClientIp('203.0.113.7', CONNECTION, 1)).toBe('203.0.113.7')
  })

  it('cannot be shifted by stuffing more hops into the header', () => {
    const spoofed = Array.from({ length: 20 }, (_, index) => `9.9.9.${index}`).join(', ')

    expect(resolveClientIp(`${spoofed}, 203.0.113.7`, CONNECTION, 1)).toBe('203.0.113.7')
  })

  it('counts from the right for multi-proxy topologies', () => {
    expect(resolveClientIp('1.2.3.4, 203.0.113.7, 172.16.0.1', CONNECTION, 2)).toBe('203.0.113.7')
  })

  it('falls back to the connection address when the header is shorter than the configured depth', () => {
    // 头里的层数比配置少 —— 代理配置与实际不符，此时任何一项都不可信
    expect(resolveClientIp('203.0.113.7', CONNECTION, 3)).toBe(CONNECTION)
    expect(resolveClientIp(undefined, CONNECTION, 1)).toBe(CONNECTION)
    expect(resolveClientIp('  ,  ', CONNECTION, 1)).toBe(CONNECTION)
  })
})

describe('resolveTrustedProxyDepth', () => {
  it('defaults to trusting no proxy', () => {
    expect(resolveTrustedProxyDepth({})).toBe(0)
  })

  it('reads a non-negative integer from the environment', () => {
    expect(resolveTrustedProxyDepth({ NUXT_TRUSTED_PROXY_DEPTH: '1' })).toBe(1)
    expect(resolveTrustedProxyDepth({ NUXT_TRUSTED_PROXY_DEPTH: '2' })).toBe(2)
  })

  it('falls back to the safe default on malformed values instead of throwing', () => {
    // 代理层数写错不该让进程起不来，但也绝不能因此去信任一个可伪造的头
    for (const value of ['-1', '1.5', 'yes', '']) {
      expect(resolveTrustedProxyDepth({ NUXT_TRUSTED_PROXY_DEPTH: value })).toBe(0)
    }
  })
})
