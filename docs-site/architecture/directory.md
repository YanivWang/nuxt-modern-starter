# 目录结构

## 顶层一览

```
nuxt-modern-starter/
├── app/                 # Nuxt 4 应用源码（pages/composables/features/...）
├── config/              # 部署无关的静态配置
├── server/              # Nitro 服务端（SEO 路由、SWR 失效、301 中间件）
├── i18n/                # vue-i18n 语言包与 helper
├── tests/               # Vitest 单元测试 + Nuxt smoke
├── docker/              # Dockerfile、Compose、Nginx 样例
├── docs/                # 仓库内精简 Markdown 约定
├── docs-site/           # 本文档站（VitePress）
├── public/              # 静态资源（og-default.png 等）
├── nuxt.config.ts       # Nuxt 配置、routeRules、runtimeConfig
└── package.json
```

## `app/` — 应用主体

### 路由入口 `app/pages/`

| 路径                            | 对应 URL                 | 说明                               |
| ------------------------------- | ------------------------ | ---------------------------------- |
| `[[language]]/index.vue`        | `/`、`/en`               | 首页                               |
| `[[language]]/pricing.vue`      | `/pricing`               | 定价（SSR）                        |
| `[[language]]/about.vue`        | `/about`                 | 关于（prerender）                  |
| `[[language]]/help.vue`         | `/help`                  | 帮助 + FAQ                         |
| `[[language]]/news/`            | `/news/**`               | 新闻列表/详情                      |
| `[[language]]/sign-in.vue`      | `/sign-in`               | 登录（noindex）                    |
| `[[language]]/sign-up.vue`      | `/sign-up`               | 注册（noindex）                    |
| `[[language]]/[...slug].vue`    | 未匹配                   | 404                                |
| `workspace/index.vue`           | `/workspace`             | 工作台                             |
| `workspace/templates/index.vue` | `/workspace/templates`   | 模板占位                           |
| `docs/[id].vue`                 | `/docs/:id`、`/docs/new` | 编辑器（`:id` 为项目 id 或 `new`） |
| `account.vue`                   | `/account`               | 账户设置                           |

各页面完整渲染方式见 [路由与渲染 — 各页面渲染方式](/architecture/routing#各页面渲染方式) 与 [各页面亮点](/architecture/routing#各页面亮点)。

::: tip 规则

- **公开页** → `app/pages/[[language]]/`
- **产品页** → `app/pages/workspace`、`docs`、`account.vue`（不要放在 `[[language]]` 下）
  :::

### 功能模块 `app/features/`

每个 feature 是一个 **垂直切片**，推荐结构：

```
app/features/my-feature/
├── components/       # 仅本 feature 使用的 UI
├── composables/      # 可选
├── stores/           # 可选
├── api.ts            # 可选，feature 私有 API
├── types/            # 可选
├── constants/        # 可选
├── utils/            # 可选
└── index.ts          # 唯一对外导出面
```

**现有 feature：**

| 目录             | 写什么代码                                                          |
| ---------------- | ------------------------------------------------------------------- |
| `product-shell/` | 产品区侧边栏、导航 config                                           |
| `account-shell/` | 账户区壳层、导航 config                                             |
| `workspace/`     | 项目列表 UI + `/projects` API；创建跳转 `/docs/new`；卡片装饰缩略图 |
| `editor/`        | YanivEditor PPT 编辑器 UI + `/documents` API；2s 自动保存           |
| `templates/`     | 模板占位页                                                          |
| `account/`       | 账户设置 UI                                                         |

::: warning 跨 feature 引用
其他模块只能 `import from '~/features/xxx'`，不要深入 `~/features/xxx/components/...`。
:::

### 共享层（框架级）

| 目录                     | 放什么                                                                               | 不放什么                |
| ------------------------ | ------------------------------------------------------------------------------------ | ----------------------- |
| `app/components/base/`   | AppContainer、PageContainer、BaseButton、BaseLogo、BasePicture 等通用组件            | 业务页面块              |
| `app/components/layout/` | AppHeader、AppFooter、AppShellHeader、LanguageSwitcher、ThemeSwitch、UserAccountMenu | feature 专属 UI         |
| `app/composables/`       | useAuth、usePageSeo、useLocalePath、useTheme、useLanguageSwitch、useUserAvatar       | feature 专属 composable |
| `app/stores/`            | auth、language、theme                                                                | feature 专属 store      |
| `app/utils/`             | auth-session、safe-redirect、attribution-params、formatDate、antdIcon、load-script   | 业务逻辑                |
| `app/layouts/`           | default、product、editor、account、empty                                             | —                       |
| `app/middleware/`        | locale.global、auth                                                                  | —                       |
| `app/plugins/`           | i18n、auth、attribution、analytics                                                   | —                       |

### API 与 HTTP

```
app/
├── api/
│   ├── clients.ts      # createPublicApiClient / createAuthApiClient
│   ├── public.ts       # 公开内容适配器
│   └── auth.ts         # 鉴权适配器 + createProductApiClient
└── lib/http/
    ├── client.ts       # createApiClient（$fetch 封装）
    ├── error.ts        # assertApiSuccess、getApiErrorMessage
    ├── headers.ts      # Bearer header、日志脱敏
    └── types.ts        # ApiResponse 等类型
```

## `config/` — 静态配置

| 文件             | 内容                                        |
| ---------------- | ------------------------------------------- |
| `site.ts`        | 站点名、语言列表、`PUBLIC_PAGE_PATHS`、导航 |
| `routes.ts`      | prerender/SWR/CSR 规则、路径 helper         |
| `auth.ts`        | 鉴权端点、cookie 键、token 过期时间         |
| `theme.ts`       | Ant Design token 映射                       |
| `content/faq.ts` | 帮助页 FAQ 本地数据                         |

## `server/` — 服务端

| 文件                              | 作用                                           |
| --------------------------------- | ---------------------------------------------- |
| `api/revalidate.post.ts`          | `POST /api/revalidate`，按 paths/slug 清除 SWR |
| `routes/sitemap.xml.ts`           | 动态 sitemap                                   |
| `routes/robots.txt.ts`            | robots 规则                                    |
| `middleware/product-canonical.ts` | `/en/workspace` → `/workspace` 301             |
| `utils/seo.ts`                    | sitemap/robots 生成逻辑                        |
| `utils/revalidate.ts`             | Nitro SWR cache key 与 `purgeRouteCaches`      |

## `i18n/` — 国际化

| 文件                      | 作用                                         |
| ------------------------- | -------------------------------------------- |
| `index.ts`                | 语言模块加载、URL 切换 helper                |
| `<locale>/index.ts`       | 聚合该 locale 的 `modules/*.json` 文案       |
| `<locale>/modules/*.json` | 按 global / marketing / product 分域维护文案 |

## `tests/` — 测试

```
tests/
├── unit/           # 纯逻辑、middleware、API 适配器
└── nuxt/           # Nuxt 环境 smoke
```

## 新人「代码写哪」速查

| 我要做…             | 写在这里                                                |
| ------------------- | ------------------------------------------------------- |
| 新的营销/SEO 页     | `app/pages/[[language]]/` + 更新 `config/site.ts`       |
| 新的登录后功能页    | `app/pages/workspace/` 或新 top-level + `app/features/` |
| 复杂业务 UI         | `app/features/<name>/components/`                       |
| 跨页面复用的小组件  | `app/components/base/` 或 `layout/`                     |
| 公开内容 API        | `app/api/public.ts`                                     |
| 鉴权相关 API        | `app/api/auth.ts`                                       |
| 某 feature 私有 API | `app/features/<name>/api.ts`                            |
| 共享 composable     | `app/composables/`                                      |
| 全局状态            | `app/stores/` 或 `app/features/<name>/stores/`          |
| 站点级常量          | `config/`                                               |
| SEO 服务端逻辑      | `server/`                                               |
| 文案                | `i18n/<locale>/index.ts`                                |

## 下一步

- [路由与渲染](/architecture/routing)
- [添加功能模块](/development/add-feature)
