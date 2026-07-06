# 路由与渲染

## 路由分区

### 公开 SEO 路由

- 路径模式：`/`、`/en/*`（通过 `[[language]]` 动态段）
- 默认语言（zh-CN）**无前缀**
- 英文（en-US）使用 **`/en` 前缀**

### 产品路由（语言中性）

- `/workspace`、`/workspace/templates`
- `/docs/:id`、`/docs/new`
- `/account`

**产品 URL 永远不带 `/en` 前缀。** 若用户访问 `/en/workspace`，middleware 会 **301** 到 `/workspace`。

UI 语言由 Pinia `languageStore` 控制，与 URL 路径解耦。

## 渲染策略

配置来源：`config/routes.ts` → `nuxt.config.ts` 的 `routeRules`。

| 策略                 | 路由                                    | 行为                                | 适用场景                   |
| -------------------- | --------------------------------------- | ----------------------------------- | -------------------------- |
| **prerender**        | `/`、`/about`、`/help` 及 `/en` 变体    | 构建时生成静态 HTML                 | 变化少、SEO 重要           |
| **SWR 3600s**        | `/news/**`、`/pricing` 及 `/en` 变体    | SSR + 1 小时 stale-while-revalidate | 内容来自 API、更新频率中等 |
| **SSR**（默认）      | 其他公开页如 sign-in                    | 每次请求服务端渲染                  | 默认兜底                   |
| **CSR** `ssr: false` | `/workspace/**`、`/docs/**`、`/account` | 纯客户端渲染                        | 强交互、依赖 session       |

```ts
// config/routes.ts（摘要）
export const productRoutePatterns = ['/workspace/**', '/docs/**', '/account']
export const prerenderRoutes = ['/', '/about', '/help', '/en', '/en/about', '/en/help']
export const swrRouteRules = ['/news/**', '/en/news/**', '/pricing', '/en/pricing']
```

## 路由决策流程

```mermaid
flowchart TD
    Req[收到请求 path] --> ServerMW{server product-canonical}
    ServerMW -->|/en/workspace 等| R301[301 到无语言前缀]
    ServerMW -->|其他| Locale[locale.global.ts]
    Locale --> Slash[去尾斜杠]
    Slash --> ZhRedirect[/zh/* → 默认语言路径]
    ZhRedirect --> ProductCanon[本地化产品 URL → canonical]
    ProductCanon --> Unsupported{不支持的语言前缀?}
    Unsupported -->|是| E404[404]
    Unsupported -->|否| Render[按 routeRules 渲染]
    Render --> AuthMW{产品页 auth 中间件?}
    AuthMW -->|未登录| Login[redirect /sign-in]
    AuthMW -->|已登录| Page[渲染页面]
```

## `PUBLIC_PAGE_PATHS`

定义在 `config/site.ts`：

```ts
export const PUBLIC_PAGE_PATHS = ['/', '/pricing', '/about', '/help', '/news']
```

用途：

- 生成 sitemap 公开页列表
- hreflang 交替链接
- `publicLocalizedPaths()` 展开多语言路径

**不包含** `/sign-in`、`/sign-up`（noindex 鉴权页）。

## 新增路由检查清单

### 公开页

- [ ] 文件放在 `app/pages/[[language]]/`
- [ ] 加入 `PUBLIC_PAGE_PATHS`（若需 SEO/sitemap）
- [ ] 在 `config/routes.ts` 配置 prerender 或 SWR（若需要）
- [ ] 调用 `usePageSeo()`
- [ ] 内部链接用 `localePath()`

### 产品页

- [ ] 文件放在 `workspace/`、`docs/` 或 top-level
- [ ] `definePageMeta({ layout, middleware: 'auth' })`
- [ ] `usePageSeo({ noindex: true })`
- [ ] 确认已在 `csrRouteRules` 覆盖（默认 product 模式已覆盖）
- [ ] 侧边栏入口写入 `product-shell/config.ts` 或 `account-shell/config.ts`

## 下一步

- [请求与数据流](/architecture/data-flow)
- [添加公开页面](/development/add-page)
