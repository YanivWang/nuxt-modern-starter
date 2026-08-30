/*
  【文件职责】
    Nitro 服务端中间件：SSR 首请求时把非 canonical 的路径 301 到 canonical。
    覆盖尾斜杠（/about/ → /about）、默认语言前缀（/zh/pricing → /pricing）
    与带语言前缀的产品 URL（/en/workspace → /workspace）三类，规则来自
    config/routes.ts 的 canonicalRequestPath，与 app/middleware/locale.global.ts 同源。

  【架构位置】
    server 层 — Nitro middleware，在页面渲染与静态资源命中之前执行；
    分工于 app middleware（后者兜住客户端 SPA 导航）。

  【主要导出 / 路由】
    default export（defineEventHandler）；作用于 /about/、/zh/**、/en/workspace、/en/docs/**、/en/account 等。

  【依赖关系】
    - 依赖：config/routes.ts（canonicalRequestPath）
    - 被引用：Nitro 自动注册 server/middleware/*；tests/unit/product-routes.test.ts 测同源纯函数，
      tests/e2e/specs/public-site.spec.ts 测真实 301

  【渲染 / 数据】
    仅 SSR 首请求；纯 path 重定向，保留 query string；不访问 API。

  【边界与注意】
    这一层不能省：prerender 出来的 /about/index.html 会被 Nitro 当静态资源直接命中，
    请求根本不进 Nuxt 应用，客户端 middleware 的尾斜杠 301 因此对首屏无效。
    /en/pricing 等公开页语言前缀是 canonical 的一部分，不在此处理。
*/
import { defineEventHandler, getRequestURL, sendRedirect } from 'h3'
import { canonicalRequestPath } from '../../config/routes'

export default defineEventHandler((event) => {
  const requestUrl = getRequestURL(event)
  const canonicalPath = canonicalRequestPath(requestUrl.pathname)

  if (!canonicalPath) {
    return
  }

  // 301 到 canonical 路径，保留 search 参数
  return sendRedirect(event, `${canonicalPath}${requestUrl.search}`, 301)
})
