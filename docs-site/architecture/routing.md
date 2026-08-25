# 路由与渲染

## 路由分区

### 公开 SEO 路由

- 路径模式：`/`、`/<prefix>/*`（通过 `[[language]]` 动态段）
- 默认语言（zh-CN）**无前缀**
- 其余 14 种语言各用自己的前缀，来自 `config/site.ts` 的 `SITE_LOCALE_PREFIX_MAP`
  （`/en`、`/kr`、`/zh-hk`、`/pt-br` …，完整清单见[国际化](/architecture/i18n#支持语言)）

> 下文表格与示例统一用 `/en` 举例，实际对全部非默认语言前缀同样生效。

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
| **SWR 3600s**        | `/news`、`/news/**` 及各语言变体        | SSR + 1 小时 stale-while-revalidate | 内容来自 API、更新频率中等 |
| **SSR**（默认）      | `/pricing`、`/sign-in` 等公开页         | 每次请求服务端渲染                  | 默认兜底                   |
| **CSR** `ssr: false` | `/workspace/**`、`/docs/**`、`/account` | 纯客户端渲染                        | 强交互、依赖 session       |

```ts
// config/routes.ts（摘要）
export const productRoutePatterns = ['/workspace/**', '/docs/**', '/account']
export const prerenderRoutes = ['/', '/about', '/help', '/en', '/en/about', '/en/help']
// 每条 SWR 根路径必须同时注册裸路径与子树：
// Nitro 为 swr 规则单独注册 handler，h3 router 里 '/news/**' 不匹配 '/news'
export const SWR_BASE_PATHS = ['/news']
export const swrRouteRules = ['/news', '/news/**', '/en/news', '/en/news/**' /* …全部语言 */]
```

### SWR 按需失效

SWR 默认最长 1 小时才后台刷新。新闻等内容变更后，后端可 webhook 调用 `POST /api/revalidate` 主动清除缓存：

```bash
# 按 slug 失效（推荐）
{ "slug": "starter-release" }

# 或显式 paths
{ "paths": ["/news", "/news/starter-release", "/en/news", "/en/news/starter-release"] }
```

需配置 `NUXT_REVALIDATE_SECRET` 并通过 Header `x-revalidate-secret` 鉴权。实现见 `server/api/revalidate.post.ts` 与 `server/utils/revalidate.ts`。

失效的做法是按 Nitro 的规则算出 cache key 再删除条目，因此 `buildRouteCacheKey()` 与
Nitro 内部实现是**强耦合**的。哈希段必须复刻 `nitropack/dist/runtime/internal/hash.mjs`：

```
digest(path).replace(/[-_]/g, '').slice(0, 10)
```

不能改用 ohash 导出的 `hash()` —— 它会先 serialize 再 digest 且不截断，算出的 key
永远匹配不到真实条目，`/api/revalidate` 会一直返回 `No matching SWR cache entries`，
而缓存实际从未被清除。`tests/unit/revalidate-nitro-contract.test.ts` 从 nitropack 源码
提取真实实现来比对，Nitro 升级导致算法漂移时会红。

另外，缓存本身默认按进程隔离，多实例部署下 revalidate 只影响收到请求的那个进程，
见[部署概览](/deployment/overview)的「SWR 页面缓存与多实例」。

## 各页面渲染方式

当前预置的 **13 个页面文件**，按路由分区与 `routeRules` 对应如下。

### 公开 SEO 区（`app/pages/[[language]]/`）

| 页面     | 路由                            | 页面文件          | 渲染方式        | 说明                                               |
| -------- | ------------------------------- | ----------------- | --------------- | -------------------------------------------------- |
| 首页     | `/`、`/en`                      | `index.vue`       | **prerender**   | 构建时静态 HTML，纯 i18n                           |
| 关于     | `/about`、`/en/about`           | `about.vue`       | **prerender**   | 构建时静态 HTML，纯 i18n                           |
| 帮助     | `/help`、`/en/help`             | `help.vue`        | **prerender**   | 构建时静态 HTML；i18n 文案 + FAQ 本地 config       |
| 定价     | `/pricing`、`/en/pricing`       | `pricing.vue`     | **SSR**（默认） | 每次请求服务端渲染，内容来自 API                   |
| 新闻列表 | `/news`、`/en/news`             | `news/index.vue`  | **SWR 3600s**   | 摘要来自 API；基础 SEO meta；支持按需 revalidate   |
| 新闻详情 | `/news/:slug`、`/en/news/:slug` | `news/[slug].vue` | **SWR 3600s**   | 正文来自 API；Article JSON-LD；支持按需 revalidate |
| 登录     | `/sign-in`、`/en/sign-in`       | `sign-in.vue`     | **SSR**（默认） | noindex，不在 `PUBLIC_PAGE_PATHS`                  |
| 注册     | `/sign-up`、`/en/sign-up`       | `sign-up.vue`     | **SSR**（默认） | noindex，不在 `PUBLIC_PAGE_PATHS`                  |
| 404 兜底 | 未匹配的公开路径（如 `/foo`）   | `[...slug].vue`   | **SSR**（默认） | HTTP 404 + noindex                                 |

### 登录产品区（语言中性 URL，不带 `/en` 前缀）

| 页面   | 路由                     | 页面文件                        | 渲染方式 | 说明                                                                                                                  |
| ------ | ------------------------ | ------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------- |
| 工作台 | `/workspace`             | `workspace/index.vue`           | **CSR**  | 需 `auth` 中间件；列表/删除；创建跳转 `/docs/new`                                                                     |
| 模板   | `/workspace/templates`   | `workspace/templates/index.vue` | **CSR**  | 占位 UI                                                                                                               |
| 编辑器 | `/docs/:id`、`/docs/new` | `docs/[id].vue`                 | **CSR**  | YanivEditor；`WORKSPACE_NEW_PROJECT_ID`（`/docs/new`）+ `ensureDraftProject`；`EDITOR_AUTOSAVE_DEBOUNCE_MS`（2000ms） |
| 账户   | `/account`               | `account.vue`                   | **CSR**  | profile + 退出                                                                                                        |

> 未单独配置 `routeRules` 的公开路由均走 **SSR（默认）**；产品区由 `csrRouteRules` 统一设为 **CSR**。

## 各页面亮点

除渲染与数据来源外，每个预置页面的 **UI 结构、用户流程与关键行为** 如下。

### 公开 SEO 区

| 页面     | 亮点                                                                                                                                                                  |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 首页     | Hero（定位 + 主/次 CTA）/ Stats / Features / Workflow / Closing CTA；主 CTA → `/sign-up`，次 CTA → `/pricing`；`usePageSeo` 含 WebPage + Organization JSON-LD         |
| 关于     | 使命说明 + 三项价值观清单 + 项目背景段落；纯 i18n；完整 canonical / hreflang                                                                                          |
| 帮助     | 4 步快速上手 + 4 项文档资源推荐 + FAQ 折叠面板；Growth 定价方案 CTA 跳转至此                                                                                          |
| 定价     | 三档方案卡片（Starter / Growth / Custom）；Growth featured 高亮；Includes 双列能力清单；Starter/Custom CTA → `/sign-up`，Growth → `/help`；title/description 来自 API |
| 新闻列表 | 卡片网格（日期、标题、摘要、「阅读更多」）；完整 hreflang                                                                                                             |
| 新闻详情 | 正文段落渲染；slug 不存在 → 404；Article JSON-LD + `og:type=article`                                                                                                  |
| 登录     | 居中 auth-card；`?redirect=` 安全回跳（`resolveSafeRedirectPath`），默认 `/workspace`；支持 `?username=` 预填                                                         |
| 注册     | 密码最少 6 位 + 确认密码校验；注册 **不自动登录**；成功后跳转 `/sign-in?username=`                                                                                    |
| 404 兜底 | 友好 404 文案 + 回首页链接；HTTP 404；noindex、无 hreflang                                                                                                            |

### 登录产品区

| 页面   | 亮点                                                                                                                                                                                                                                                     |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 工作台 | `product` layout + ProductShell 侧边栏；项目卡片网格；idle 预加载编辑器路由与 chunk；删除确认；noindex                                                                                                                                                   |
| 模板   | 6 张虚线占位卡片 + `a-empty` 空状态；无 API，可安全替换为真实模板功能                                                                                                                                                                                    |
| 编辑器 | `editor` 全屏 layout；`/docs/new` 草稿模式，首次非空保存后 `replace` 到 `/docs/:id`；`cachedProject` 防切换闪烁；YanivEditor（`mode: edit`、`preset: full`、`appearance: custom`）；2s debounce 自动保存 + 路由离开 flush；标题同步 project/document API |
| 账户   | `account` layout + AccountShell；头像 / 昵称 / 扩展 profile 字段；API 失败可重试；退出后回本地化首页                                                                                                                                                     |

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
