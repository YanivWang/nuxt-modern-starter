/*
  【文件职责】
    Nitro 路由 handler：GET /sitemap.xml，返回公开页 URL 列表（含新闻详情动态 slug）。
    调用 server/utils/seo.ts buildSitemapXmlAsync 拉取新闻 slug 并组装 XML。

  【架构位置】
    server 层 — 公开 SEO 基础设施；与 robots.txt 配对。

  【主要导出 / 路由】
    GET /sitemap.xml

  【依赖关系】
    - 依赖：server/utils/seo.ts（buildSitemapXmlAsync）、runtimeConfig.public.siteUrl / apiBase
    - 被引用：搜索引擎爬虫、robots.txt Sitemap 声明

  【渲染 / 数据】
    每次请求动态生成；新闻 slug 来自 GET /content/news（apiBase）；失败时用静态 fallback。

  【边界与注意】
    不含产品区与鉴权页 URL；公开页集合源自 config/site PUBLIC_PAGE_PATHS + config/routes 展开。
*/
import { defineEventHandler, setHeader } from 'h3'
import { useRuntimeConfig } from '#imports'
import { buildSitemapXmlAsync } from '../utils/seo'

export default defineEventHandler(async (event) => {
  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  const runtimeConfig = useRuntimeConfig(event)

  return buildSitemapXmlAsync(runtimeConfig.public.siteUrl, runtimeConfig.public.apiBase)
})
