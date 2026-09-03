/*
  【文件职责】
    解析请求的客户端 IP，作为限流的 key 与访问日志字段。
    resolveClientIp 是纯函数；getClientIp 是它在 h3 上的接线。

  【架构位置】
    server/utils — 被 server/middleware/request-id.ts、server/api/telemetry/errors.post.ts、
    server/api/revalidate.post.ts 共用。

  【主要导出 / 路由】
    resolveClientIp、getClientIp、TRUSTED_PROXY_DEPTH

  【依赖关系】
    - 依赖：config/observability.ts（resolveTrustedProxyDepth）、h3
    - 被引用：server/middleware/request-id.ts、server/api/telemetry/errors.post.ts、
      server/api/revalidate.post.ts、tests/unit/client-ip.test.ts

  【渲染 / 数据】
    仅服务端；可信代理层数在模块加载时解析一次。

  【边界与注意】
    不要改回 getRequestIP(event, { xForwardedFor: true })。那个写法取的是 x-forwarded-for
    的**最左**一项，而最左项是客户端自己写进去的 —— 反向代理只会往右追加真实来源
    （nginx 的 $proxy_add_x_forwarded_for 就是如此）。用它当限流 key 时：
      1. 攻击者每个请求换一个伪造 IP，配额直接失效；
      2. 限流器的 bucket 表按攻击者给的 key 无限增长。
    也就是说，本该防住刷接口的那道闸，反而成了放大器。

    真实客户端位于右数第 NUXT_TRUSTED_PROXY_DEPTH 项。depth 为 0（默认）时完全不看该头，
    直接用连接地址 —— 未知拓扑下宁可粒度粗，也不要一个可伪造的 key。
    头里的项数少于 depth 时同样回退连接地址：那说明代理层数配置与实际不符。
*/
import { getHeader, getRequestIP, type H3Event } from 'h3'
import { resolveTrustedProxyDepth } from '../../config/observability'

export const TRUSTED_PROXY_DEPTH = resolveTrustedProxyDepth()

export const resolveClientIp = (
  forwardedFor: string | undefined,
  connectionAddress: string | undefined,
  trustedProxyDepth: number
): string | undefined => {
  if (trustedProxyDepth > 0 && forwardedFor) {
    const hops = forwardedFor
      .split(',')
      .map((hop) => hop.trim())
      .filter(Boolean)

    // 右数第 depth 项：最右边那些是可信代理自己追加的，再往左就是客户端能写的内容
    const client = hops[hops.length - trustedProxyDepth]

    if (client) {
      return client
    }
  }

  return connectionAddress
}

/** 限流 key 用；取不到地址时回退固定串，避免 undefined 变成所有请求共用的同一个 key */
export const getClientIp = (event: H3Event) =>
  resolveClientIp(getHeader(event, 'x-forwarded-for'), getRequestIP(event), TRUSTED_PROXY_DEPTH) ||
  'unknown'
