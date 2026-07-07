/*
  【文件职责】
    Nitro 服务端最早中间件：SSR 首请求时将带语言前缀的产品 URL 301 到 canonical。
    与 app/middleware/locale.global.ts 使用同一套 localizedProductPathToCanonical 规则。

  【架构位置】
    server 层 — Nitro middleware，在页面渲染前执行；分工于 app middleware（客户端导航兜底）。

  【主要导出 / 路由】
    default export（defineEventHandler）；作用于 /en/workspace、/en/docs/**、/en/account 等。

  【依赖关系】
    - 依赖：config/routes.ts（localizedProductPathToCanonical）
    - 被引用：Nitro 自动注册 server/middleware/*

  【渲染 / 数据】
    仅 SSR 首请求；纯 path 重定向，保留 query string；不访问 API。

  【边界与注意】
    双层 canonical：本文件处理 SSR 入站，app/middleware/locale.global.ts 处理客户端 navigateTo。
    /en/pricing 等非产品 path 不在此 middleware 处理（由 locale middleware 保留 /en 前缀）。
*/
import { defineEventHandler, getRequestURL, sendRedirect } from 'h3'
import { localizedProductPathToCanonical } from '../../config/routes'

export default defineEventHandler((event) => {
  const requestUrl = getRequestURL(event)
  const canonicalPath = localizedProductPathToCanonical(requestUrl.pathname)

  if (!canonicalPath) {
    return
  }

  // 301 到语言中性产品 URL，保留 search 参数
  return sendRedirect(event, `${canonicalPath}${requestUrl.search}`, 301)
})
