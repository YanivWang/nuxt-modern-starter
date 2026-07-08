# 配置文件参考

## nuxt.config.ts

| 配置块                 | 作用                                |
| ---------------------- | ----------------------------------- |
| `modules`              | Pinia、Ant Design Vue、ESLint       |
| `runtimeConfig`        | 服务端 `revalidateSecret`           |
| `runtimeConfig.public` | 公开环境变量映射                    |
| `routeRules`           | prerender / SWR / CSR / CSP headers |
| `css`                  | 全局 SCSS                           |
| `typescript.strict`    | 严格模式 + typeCheck                |

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
ACCESS_TOKEN_MAX_AGE // 900s
REFRESH_TOKEN_MAX_AGE // 30d
AuthUser / AuthRouteMeta // 类型
```

## Feature 常量

| 位置                            | 导出                                             | 说明                      |
| ------------------------------- | ------------------------------------------------ | ------------------------- |
| `app/features/workspace/api.ts` | `WORKSPACE_NEW_PROJECT_ID`                       | `'new'`，对应 `/docs/new` |
| `app/features/workspace/api.ts` | `getWorkspaceDocPath` / `getWorkspaceNewDocPath` | 编辑器链接 helper         |

## config/theme.ts

Ant Design Vue `theme.token` 映射。

## app/app.config.ts

UI 级默认（品牌、layout 开关等）。

## 产品导航 config

| 文件                                   | 内容                                                                       |
| -------------------------------------- | -------------------------------------------------------------------------- |
| `app/features/product-shell/config.ts` | `productNavItems`（工作台、主题模板）、`productFooterNavItems`（定价链接） |
| `app/features/account-shell/config.ts` | `accountNavItems`                                                          |

## `server/` — 服务端路由与工具

| 文件                              | 作用                                           |
| --------------------------------- | ---------------------------------------------- |
| `api/revalidate.post.ts`          | `POST /api/revalidate`，按 paths/slug 清除 SWR |
| `routes/sitemap.xml.ts`           | 动态 sitemap                                   |
| `routes/robots.txt.ts`            | robots 规则                                    |
| `middleware/product-canonical.ts` | `/en/workspace` → `/workspace` 301             |
| `utils/seo.ts`                    | sitemap/robots 生成逻辑                        |
| `utils/revalidate.ts`             | Nitro cache key 计算与 `purgeRouteCaches`      |

### `POST /api/revalidate`

新闻等内容变更后，由 `nuxt-modern-starter-api` webhook 调用，主动清除 SWR 缓存（避免最长 1 小时陈旧内容）。

```bash
curl -X POST https://example.com/api/revalidate \
  -H 'Content-Type: application/json' \
  -H 'x-revalidate-secret: <NUXT_REVALIDATE_SECRET>' \
  -d '{"slug":"starter-release"}'
```

Body 支持：

- `{ "slug": "article-slug" }` — 自动展开为 `/news`、`/news/:slug`、`/en/news`、`/en/news/:slug`
- `{ "paths": ["/news", "/en/news/foo"] }` — 显式路径列表

响应：`{ requested: string[], purged: string[] }`。未配置 secret → 503；密钥错误 → 401。

## 下一步

- [目录结构](/architecture/directory)
- [环境变量](/deployment/env)
