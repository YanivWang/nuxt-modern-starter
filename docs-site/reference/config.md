# 配置文件参考

## nuxt.config.ts

| 配置块                              | 作用                                                                |
| ----------------------------------- | ------------------------------------------------------------------- |
| `modules`                           | Pinia、Ant Design Vue、ESLint                                       |
| `runtimeConfig`                     | 服务端 `revalidateSecret`（不下发到客户端）                         |
| `runtimeConfig.public`              | 公开环境变量映射（见下表默认值）                                    |
| `routeRules`                        | prerender / SWR / CSR / CSP headers                                 |
| `css`                               | 全局 SCSS（`main.scss`）                                            |
| `vite.css.preprocessorOptions.scss` | 向 SFC 注入 `tokens/_variables.scss`                                |
| `vite.build`                        | `manualChunks` vendor 分包 + `chunkSizeWarningLimit: 3000`          |
| `antd.extractStyle`                 | SSR 提取 Ant Design CSS-in-JS 样式                                  |
| `nitro.storage`                     | SWR 页面缓存驱动，来自 `config/cache.ts` 的 `resolveCacheStorage()` |
| `typescript.strict`                 | 严格模式 + typeCheck                                                |

### `runtimeConfig.public` 默认值（`nuxt.config.ts`）

| 键                       | 默认                        | 说明                                                          |
| ------------------------ | --------------------------- | ------------------------------------------------------------- |
| `appEnv`                 | `development`               | 为 `production` 时 auth cookie 置 `secure`                    |
| `apiBase`                | `http://localhost:2027/api` | 已含 `/api` 前缀；adapter 写 `/projects` 而非 `/api/projects` |
| `siteUrl`                | `http://localhost:3000`     | canonical / sitemap 基础 URL                                  |
| `googleSiteVerification` | 空                          | 传入 `usePageSeo({ siteVerification })`；空值不输出 meta      |
| `baiduSiteVerification`  | 空                          | 同上                                                          |
| `analyticsEnabled`       | `false`                     | 启用第三方脚本需同步放宽 CSP `script-src`                     |
| `analyticsScriptSrc`     | 空                          | 为空时 analytics 插件静默跳过                                 |
| `analyticsDeferMs`       | `3000`                      | 无效或非数字时回退 3000                                       |

`routeRules` 由 `config/routes.ts` 展开：`prerenderRoutes`（6 条）、`swrRouteRules`（`swr: 3600`）、`csrRouteRules`（`ssr: false`）。

## config/site.ts

```ts
SITE_NAME
SITE_DESCRIPTION
DEFAULT_SITE_URL // sitemap/robots fallback 用占位域名
SUPPORTED_LOCALES // 15 个内置 locale，默认 zh-CN
SITE_LOCALE_PREFIX_MAP // zh-CN 使用无前缀 canonical，其余语言映射到 /en、/pt、/zh-hk 等
SITE_HREFLANG_MAP // hreflang / html lang 来源
SITE_LOCALE_OPTIONS // 语言选择器 label 与业务语言 id 来源
PUBLIC_PAGE_PATHS // sitemap/hreflang 来源
NAV_ITEMS // 公开页导航
DEFAULT_SEO // 默认 title/description/ogImage
SITE_ORG // Organization JSON-LD：name、logo
```

## config/routes.ts

```ts
productRoutePatterns // CSR 路由模式
csrRouteRules
prerenderRoutes // 构建时静态化列表
swrRouteRules // SWR 1h 缓存
PRERENDER_BASE_PATHS // ['/', '/about', '/help']
PRERENDER_LOCALES // ['zh-CN', 'en-US']
SWR_BASE_PATHS // ['/news']
isProductPath() // 判断是否产品 URL
localizedPath() // 公开页加语言前缀
localizedProductPathToCanonical() // /en/workspace → /workspace
publicLocalizedPaths() // 多语言公开页展开
```

## config/auth.ts

```ts
AUTH_API_ENDPOINTS // /login /register /refresh ...
AUTH_COOKIE_KEYS
AUTH_REDIRECTS // login: '/sign-in'
ACCESS_TOKEN_MAX_AGE // 900s（15 分钟）
REFRESH_TOKEN_MAX_AGE // 2_592_000s（30 天）
AuthUser / AuthRouteMeta // 类型
```

## Feature 常量

| 位置                           | 导出                                             | 说明                      |
| ------------------------------ | ------------------------------------------------ | ------------------------- |
| `app/api/workspace-project.ts` | `WORKSPACE_NEW_PROJECT_ID`                       | `'new'`，对应 `/docs/new` |
| `app/api/workspace-project.ts` | `getWorkspaceDocPath` / `getWorkspaceNewDocPath` | 编辑器链接 helper         |

## config/cache.ts

SWR / ISR 页面缓存的存储驱动，由 `nuxt.config.ts` 的 `nitro.storage` 消费。**构建期求值**，
驱动选择写进 `.output`，运行时不再变化。

```ts
CACHE_DRIVERS // ['memory', 'fs']
DEFAULT_CACHE_FS_BASE // './.data/cache'
isCacheDriver(value)
resolveCacheStorage(env?) // memory → {}；fs → { cache: { driver: 'fsLite', base } }
```

| 环境变量             | 默认            | 说明                                                      |
| -------------------- | --------------- | --------------------------------------------------------- |
| `NUXT_CACHE_DRIVER`  | `memory`        | 可选 `memory` \| `fs`；未知值在构建期直接抛错，不静默回退 |
| `NUXT_CACHE_FS_BASE` | `./.data/cache` | `fs` 驱动的存储目录                                       |

默认 `memory` 时缓存按进程隔离，`POST /api/revalidate` 只清得掉收到请求的那个进程。
多进程 / 多容器部署见[部署概览 — SWR 页面缓存与多实例](/deployment/overview#swr-页面缓存与多实例)。

## config/antd-locale.ts

将 `SupportedLocale` 映射为 Ant Design Vue 内置语言包，由 `app/app.vue` 的 `a-config-provider` 按需 `import()`：

```ts
loadAntdLocale(locale) // 动态加载对应 ant-design-vue/es/locale/*
```

| 特例    | 行为                                    |
| ------- | --------------------------------------- |
| `ph-PH` | Ant Design 无 Filipino 包，回退 `en_US` |

其余 14 种语言各对应官方 locale 文件（见 `ANTD_LOCALE_LOADERS`）。

## config/content/faq.ts

帮助页 FAQ 静态内容单一来源：

```ts
faqItems // FaqItem[]，每条含 key + 多语言 question/answer
resolveLocalizedContent(content, locale) // 回退 en-US → zh-CN
```

由 `app/api/public.ts` 的 `getFaqItems()` 按当前语言读取；不经远程 API。

## config/theme-palette.json

品牌色与语义色的**唯一编辑入口**。修改后运行 `pnpm generate:theme`（`prebuild` 也会自动执行）。

## config/theme.ts

Ant Design Vue `theme.token` 映射（`getAntdThemeToken`），从 `theme-palette.json` 读取色值。`applyThemeCssVariables()` **已在** `useTheme()` 中启用：切主题时将 `themeTokens` 基础色写入 `--app-*`，与 ConfigProvider 同源（详见 [样式体系 — 主题切换与运行时同步](/tech-stack/styles#主题切换与运行时同步-已实现)）。

## app/assets/styles/

| 路径                     | 作用                                             |
| ------------------------ | ------------------------------------------------ |
| `main.scss`              | 全局样式入口                                     |
| `tokens/_variables.scss` | Sass 构建期变量（自动生成）                      |
| `tokens/_root.scss`      | 亮色 `--app-*` CSS 变量与派生 token（手写）      |
| `tokens/_dark.scss`      | 暗色覆盖（自动生成）                             |
| `tokens.ts`              | `cssVarTokens`、`getCssVar`、`setCssVar`         |
| `patterns/_page.scss`    | 公开页 `.page-*` 模式类                          |
| `patterns/_home.scss`    | 营销首页 `.hero`、`.feature-card`、`.workflow-*` |
| `patterns/_product.scss` | 产品区 `.app-*`、`.workspace-card` 模式类        |
| `patterns/_editor.scss`  | 编辑器 `.editor-workspace*` 全屏布局             |

详见 [样式体系](/tech-stack/styles)（含完整 token 目录与 pattern 用法）。

## app/app.config.ts

UI 级默认（品牌、layout 开关等）。

## 产品导航 config

| 文件                                   | 内容                                                                       |
| -------------------------------------- | -------------------------------------------------------------------------- |
| `app/features/product-shell/config.ts` | `productNavItems`（工作台、主题模板）、`productFooterNavItems`（定价链接） |
| `app/features/account-shell/config.ts` | `accountNavItems`                                                          |

## `server/` — 服务端路由与工具

| 文件                           | 作用                                                  |
| ------------------------------ | ----------------------------------------------------- |
| `api/revalidate.post.ts`       | `POST /api/revalidate`，按 paths/slug 清除 SWR        |
| `routes/sitemap.xml.ts`        | 动态 sitemap                                          |
| `routes/robots.txt.ts`         | robots 规则                                           |
| `middleware/canonical-path.ts` | 尾斜杠 / `/zh` 前缀 / `/en/workspace` → canonical 301 |
| `utils/seo.ts`                 | sitemap/robots 生成逻辑                               |
| `utils/revalidate.ts`          | Nitro cache key 计算与 `purgeRouteCaches`             |

### `POST /api/revalidate`

新闻等内容变更后，由 `nuxt-modern-starter-api` webhook 调用，主动清除 SWR 缓存（避免最长 1 小时陈旧内容）。

```bash
curl -X POST https://example.com/api/revalidate \
  -H 'Content-Type: application/json' \
  -H 'x-revalidate-secret: <NUXT_REVALIDATE_SECRET>' \
  -d '{"slug":"starter-release"}'
```

Body 支持：

- `{ "slug": "article-slug" }` — 展开为全部 15 种语言的 `/news` 与 `/news/:slug`（共 30 条），
  例如 `/news`、`/news/:slug`、`/en/news`、`/en/news/:slug`、`/kr/news/:slug` …
- `{ "paths": ["/news", "/en/news/foo"] }` — 显式路径列表

响应：`{ requested: string[], purged: string[], missed: string[] }` —— `missed` 是算出 cache key
但存储里没有对应条目的路径（该页尚未被缓存过）。

| 状态码 | 场景                                              |
| ------ | ------------------------------------------------- |
| `200`  | 全部命中并清除                                    |
| `207`  | 部分命中（`missed` 非空但不是全部）               |
| `400`  | 未提供 `paths`/`slug`，或路径不在 `swrRouteRules` |
| `401`  | `x-revalidate-secret` 缺失或不匹配                |
| `429`  | 超出单实例内存限流（10 次 / 分钟 / IP）           |
| `500`  | 全部路径都没有匹配的缓存条目                      |
| `503`  | 未配置 `NUXT_REVALIDATE_SECRET`                   |

## 下一步

- [目录结构](/architecture/directory)
- [环境变量](/deployment/env)
