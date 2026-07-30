# Batch 1 Report: config + nuxt.config

Generated: 2026-07-30（深度审阅 + doc-claims 证据）

## 已读文件（11/11）

- app/app.config.ts
- app/shims.d.ts
- app/types/document.ts
- app/types/workspace-project.ts
- config/antd-locale.ts
- config/auth.ts
- config/content/faq.ts
- config/routes.ts
- config/site.ts
- config/theme.ts
- nuxt.config.ts

## 代码-文档对齐说明

- 「API 地址未写默认值」→ `nuxt.config.ts` `runtimeConfig.public.apiBase` = `http://localhost:2026/api`，`siteUrl` = `http://localhost:3000`
- 「Node/pnpm 版本未标明 engines」→ `package.json` `engines` 要求 Node 22.22.3、pnpm 11.5.2
- 「产品区 CSR 仅口头描述」→ `config/routes.ts` `productRoutePatterns` + `csrRouteRules` 写入 routing/overview 文档

## 文档变更

- docs-site/architecture/auth.md → REFRESH_TOKEN_MAX_AGE = 2_592_000
- docs-site/reference/config.md → antd-locale、faq、runtimeConfig 默认值表
- docs-site/tech-stack/ant-design-vue.md → ph-PH 回退 en_US
- docs-site/deployment/overview.md → 补充 apiBase、siteUrl 默认值
- docs-site/guide/getting-started.md → 补充 engines、apiBase 对应 nuxt.config

## 注释变更

- config/auth.ts: ACCESS_TOKEN_MAX_AGE / REFRESH_TOKEN_MAX_AGE 内联注释
- config/routes.ts: prerenderRoutes 六条、productRoutePatterns CSR 说明
- app/types/document.ts: content、updatedAt 字段语义

## doc-claims 证据（本批源码关联 37 条）

| claim          | 文档                                     | evidenceHint                                                                                                          |
| -------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| routing-001    | `docs-site/architecture/routing.md`      | config/routes.ts:11 (isProductPath); config/routes.ts:10 (productRoutePatterns)                                       |
| routing-002    | `docs-site/architecture/routing.md`      | config/routes.ts:11 (localizedProductPathToCanonical); app/middleware/locale.global.ts:4 (resolveLocaleRouteDecision) |
| routing-003    | `docs-site/architecture/routing.md`      | config/routes.ts:10 (productRoutePatterns); config/routes.ts:10 (csrRouteRules)                                       |
| routing-004    | `docs-site/architecture/routing.md`      | config/routes.ts:10 (prerenderRoutes); config/routes.ts:4 (publicLocalizedPaths)                                      |
| routing-005    | `docs-site/architecture/routing.md`      | config/routes.ts:10 (swrRouteRules)                                                                                   |
| routing-006    | `docs-site/architecture/routing.md`      | config/site.ts:4 (PUBLIC_PAGE_PATHS); config/routes.ts:10 (prerenderRoutes); config/routes.ts:10 (swrRouteRules)      |
| routing-007    | `docs-site/architecture/routing.md`      | config/site.ts:4 (PUBLIC_PAGE_PATHS)                                                                                  |
| routing-008    | `docs-site/architecture/routing.md`      | config/site.ts:11 (DEFAULT_LOCALE); config/site.ts:12 (SITE_LOCALE_PREFIX_MAP); config/routes.ts:11 (localizedPath)   |
| dataflow-007   | `docs-site/architecture/data-flow.md`    | nuxt.config.ts:102 (apiBase)                                                                                          |
| dataflow-008   | `docs-site/architecture/data-flow.md`    | nuxt.config.ts:99 (revalidateSecret)                                                                                  |
| auth-001       | `docs-site/architecture/auth.md`         | config/auth.ts:10 (AUTH_REDIRECTS)                                                                                    |
| auth-002       | `docs-site/architecture/auth.md`         | config/auth.ts:10 (ACCESS_TOKEN_MAX_AGE); config/auth.ts:11 (REFRESH_TOKEN_MAX_AGE)                                   |
| auth-003       | `docs-site/architecture/auth.md`         | config/auth.ts:10 (AUTH_COOKIE_KEYS)                                                                                  |
| auth-004       | `docs-site/architecture/auth.md`         | config/auth.ts:4 (AUTH_API_ENDPOINTS)                                                                                 |
| arch-003       | `docs/architecture.md`                   | config/site.ts:11 (DEFAULT_LOCALE); config/site.ts:11 (SUPPORTED_LOCALES)                                             |
| deploy-001     | `docs-site/deployment/overview.md`       | nuxt.config.ts:102 (apiBase); nuxt.config.ts:103 (siteUrl)                                                            |
| config-001     | `docs-site/reference/config.md`          | config/routes.ts:10 (productRoutePatterns); config/routes.ts:10 (csrRouteRules)                                       |
| seo-001        | `docs-site/architecture/seo.md`          | config/site.ts:4 (PUBLIC_PAGE_PATHS); config/routes.ts:11 (isProductPath)                                             |
| config-002     | `docs-site/reference/config.md`          | config/antd-locale.ts:37 (loadAntdLocale); config/antd-locale.ts:18 (ANTD_LOCALE_LOADERS)                             |
| config-003     | `docs-site/reference/config.md`          | config/routes.ts:10 (prerenderRoutes)                                                                                 |
| config-004     | `docs-site/reference/config.md`          | nuxt.config.ts:102 (apiBase)                                                                                          |
| i18n-001       | `docs-site/architecture/i18n.md`         | config/routes.ts:11 (localizedPath); config/routes.ts:11 (isProductPath)                                              |
| i18n-002       | `docs-site/architecture/i18n.md`         | config/site.ts:11 (SUPPORTED_LOCALES); config/site.ts:11 (DEFAULT_LOCALE)                                             |
| directory-001  | `docs-site/architecture/directory.md`    | config/site.ts:4 (PUBLIC_PAGE_PATHS); config/routes.ts:11 (isProductPath)                                             |
| index-001      | `docs-site/index.md`                     | config/content/faq.ts:10 (faqItems); config/content/faq.ts:14 (getFaqItems)                                           |
| guide-gs-002   | `docs-site/guide/getting-started.md`     | nuxt.config.ts:102 (apiBase)                                                                                          |
| guide-ov-002   | `docs-site/guide/overview.md`            | config/routes.ts:10 (csrRouteRules); config/routes.ts:10 (productRoutePatterns)                                       |
| addpage-001    | `docs-site/development/add-page.md`      | config/site.ts:4 (PUBLIC_PAGE_PATHS)                                                                                  |
| env-001        | `docs-site/deployment/env.md`            | app/utils/auth-session.ts:4 (tokenCookieOptions); app/utils/auth-session.ts:4 (appEnv)                                |
| env-002        | `docs-site/deployment/env.md`            | server/api/revalidate.post.ts:65 (revalidateSecret)                                                                   |
| nuxt-001       | `docs-site/tech-stack/nuxt.md`           | nuxt.config.ts:21 (@nuxt/test-utils/module)                                                                           |
| nuxt-002       | `docs-site/tech-stack/nuxt.md`           | nuxt.config.ts:93 (additionalData)                                                                                    |
| styles-002     | `docs-site/tech-stack/styles.md`         | config/theme.ts:149 (applyThemeCssVariables)                                                                          |
| antd-doc-001   | `docs-site/tech-stack/ant-design-vue.md` | nuxt.config.ts:115 (extractStyle)                                                                                     |
| antd-doc-002   | `docs-site/tech-stack/ant-design-vue.md` | config/antd-locale.ts:9 (ph-PH)                                                                                       |
| docs-conv-002  | `docs/conventions.md`                    | config/routes.ts:10 (csrRouteRules)                                                                                   |
| docs-usage-002 | `docs/usage.md`                          | app/api/public.ts:10 (getFaqItems); app/api/public.ts:24 (faqItems)                                                   |

## 代码-文档不一致项

- 无（以代码为准；上表 claim 均已 enrich 行号校验）

## 完成标准

- [x] 已读文件数量 = 11
- [x] doc-claims 关联符号可在源码定位（见上表 evidenceHint）
- [x] `pnpm docs:sync:check --batch 1`
