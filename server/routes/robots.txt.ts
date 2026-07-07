/*
  【文件职责】
    Nitro 路由 handler：GET /robots.txt，返回 text/plain 格式的爬虫规则。
    内容由 server/utils/seo.ts buildRobotsTxt 生成，siteUrl 取自 runtimeConfig。

  【架构位置】
    server 层 — 公开 SEO 基础设施；与 sitemap.xml 配对。

  【主要导出 / 路由】
    GET /robots.txt

  【依赖关系】
    - 依赖：server/utils/seo.ts（buildRobotsTxt）、runtimeConfig.public.siteUrl
    - 被引用：搜索引擎爬虫、tests/unit/seo-server-routes.test.ts（间接测 buildRobotsTxt）

  【渲染 / 数据】
    每次请求动态生成；不缓存；Disallow 产品区与鉴权页。

  【边界与注意】
    修改 Disallow 规则须同步 server/utils/seo.ts 与 seo-server-routes 测试。
*/
import { defineEventHandler, setHeader } from 'h3'
import { useRuntimeConfig } from '#imports'
import { buildRobotsTxt } from '../utils/seo'

export default defineEventHandler((event) => {
  setHeader(event, 'content-type', 'text/plain; charset=utf-8')
  return buildRobotsTxt(useRuntimeConfig(event).public.siteUrl)
})
