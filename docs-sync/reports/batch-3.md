# Batch 3 Report: middleware + plugins + composables + utils

Generated: 2026-07-09（深度审阅 + doc-claims 证据）

## 已读文件（18/18）

- app/composables/useAuth.ts
- app/composables/useLanguageSwitch.ts
- app/composables/useLocalePath.ts
- app/composables/usePageSeo.ts
- app/composables/useTheme.ts
- app/composables/useUserAvatar.ts
- app/middleware/auth.ts
- app/middleware/locale.global.ts
- app/plugins/analytics.client.ts
- app/plugins/attribution.client.ts
- app/plugins/auth.ts
- app/plugins/i18n.ts
- app/utils/antdIcon.ts
- app/utils/attribution-params.ts
- app/utils/auth-session.ts
- app/utils/formatDate.ts
- app/utils/load-script.ts
- app/utils/safe-redirect.ts

## 代码-文档对齐说明

- 「locale 前缀表缺示例」→ `SITE_LOCALE_PREFIX_MAP` 含非直观前缀（如 ph → fil-PH）
- 「middleware 决策未文档化」→ `resolveLocaleRouteDecision` 五步树写入 i18n 架构文

## 文档变更

- docs-site/architecture/i18n.md → SITE_LOCALE_PREFIX_MAP 非直观前缀示例

## 注释变更

- app/middleware/locale.global.ts: resolveLocaleRouteDecision 五步决策树
- app/middleware/auth.ts: RBAC roles 任一 / permissions 全部
- app/composables/useAuth.ts: ensureSession 恢复链
- app/utils/antdIcon.ts: createAntdIcon inheritAttrs + tree-shake 导出
- app/utils/auth-session.ts: production secure cookie
- app/utils/safe-redirect.ts: UNSAFE_REDIRECT_PATTERN
- app/plugins/i18n.ts: 产品页优先读 cookie locale

## doc-claims 证据（本批源码关联 12 条）

| claim        | 文档                                   | evidenceHint                                                                                                                               |
| ------------ | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| routing-002  | `docs-site/architecture/routing.md`    | config/routes.ts:11 (localizedProductPathToCanonical); app/middleware/locale.global.ts:4 (resolveLocaleRouteDecision)                      |
| auth-005     | `docs-site/architecture/auth.md`       | app/middleware/auth.ts:11 (buildAuthLoginRedirect); app/middleware/auth.ts:4 (resolveAuthMiddlewareDecision)                               |
| auth-006     | `docs-site/architecture/auth.md`       | app/middleware/auth.ts:11 (isAuthorized)                                                                                                   |
| seo-002      | `docs-site/architecture/seo.md`        | app/composables/usePageSeo.ts:4 (buildPageSeoLinks); app/composables/usePageSeo.ts:4 (noindex)                                             |
| overview-002 | `docs-site/architecture/overview.md`   | server/middleware/product-canonical.ts:4 (localizedProductPathToCanonical); app/middleware/locale.global.ts:4 (resolveLocaleRouteDecision) |
| addpage-002  | `docs-site/development/add-page.md`    | app/composables/useLocalePath.ts:3 (localePath); app/composables/useLocalePath.ts:13 (isProductPath)                                       |
| addseo-001   | `docs-site/development/add-seo.md`     | app/composables/usePageSeo.ts:10 (usePageSeo)                                                                                              |
| addseo-002   | `docs-site/development/add-seo.md`     | app/composables/usePageSeo.ts:10 (buildPageSeoScripts)                                                                                     |
| conv-002     | `docs-site/development/conventions.md` | app/utils/safe-redirect.ts:4 (resolveSafeRedirectPath)                                                                                     |
| env-001      | `docs-site/deployment/env.md`          | app/utils/auth-session.ts:4 (tokenCookieOptions); app/utils/auth-session.ts:4 (appEnv)                                                     |
| pinia-002    | `docs-site/tech-stack/pinia.md`        | app/composables/useAuth.ts:3 (ensureSession)                                                                                               |
| styles-002   | `docs-site/tech-stack/styles.md`       | config/theme.ts:149 (applyThemeCssVariables)                                                                                               |

## 代码-文档不一致项

- 无（以代码为准；上表 claim 均已 enrich 行号校验）

## 完成标准

- [x] 已读文件数量 = 18
- [x] doc-claims 关联符号可在源码定位（见上表 evidenceHint）
- [x] `pnpm docs:sync:check --batch 3`
