/*
  【文件职责】
    Nitro 路由 handler：GET /healthz，进程存活探针。

  【架构位置】
    server 层 — 运维基础设施；Docker healthcheck 与编排系统 liveness probe 使用。

  【主要导出 / 路由】
    GET /healthz

  【依赖关系】
    - 依赖：无
    - 被引用：docker/docker-compose.base.yaml healthcheck、tests/e2e/specs/public-site.spec.ts

  【渲染 / 数据】
    固定 JSON，不查任何下游；不缓存。

  【边界与注意】
    存活探针必须极轻：探活打首页会连带跑一遍页面渲染栈，页面出错时会误判进程已死并触发无谓重启。
    依赖就绪与否属于 /readyz 的职责，不要混在这里。
*/
import { defineEventHandler, setHeader } from 'h3'

export default defineEventHandler((event) => {
  // 探针结果一旦被缓存，实例已经不健康了负载均衡还会拿到旧的 200
  setHeader(event, 'cache-control', 'no-store')

  return {
    status: 'ok',
    // 秒级 uptime 足以判断实例是否刚重启过，不暴露更多进程信息
    uptime: Math.round(process.uptime())
  }
})
