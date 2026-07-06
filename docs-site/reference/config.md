# 配置文件参考

## nuxt.config.ts

| 配置块                 | 作用                                |
| ---------------------- | ----------------------------------- |
| `modules`              | Pinia、Ant Design Vue、ESLint       |
| `runtimeConfig.public` | 环境变量映射                        |
| `routeRules`           | prerender / SWR / CSR / CSP headers |
| `css`                  | 全局 SCSS                           |
| `typescript.strict`    | 严格模式 + typeCheck                |

## config/site.ts

```ts
SITE_NAME
SITE_DESCRIPTION
DEFAULT_SITE_URL // sitemap/robots fallback 用占位域名
SUPPORTED_LOCALES // ['zh-CN', 'en-US']
SITE_LOCALE_PREFIX_MAP // { 'zh-CN': 'zh', 'en-US': 'en' }
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

## 下一步

- [目录结构](/architecture/directory)
- [环境变量](/deployment/env)
