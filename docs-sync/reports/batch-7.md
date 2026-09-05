# Batch 7 Report: server + assets/styles

Generated: 2026-09-05（深度审阅 + doc-claims 证据）

## 已读文件（25/25）

- app/assets/styles/main.scss
- app/assets/styles/patterns/_editor.scss
- app/assets/styles/patterns/_home.scss
- app/assets/styles/patterns/_page.scss
- app/assets/styles/patterns/_product.scss
- app/assets/styles/patterns/index.scss
- app/assets/styles/tokens.ts
- app/assets/styles/tokens/_dark.scss
- app/assets/styles/tokens/_root.scss
- app/assets/styles/tokens/_variables.scss
- app/assets/styles/tokens/index.scss
- server/api/revalidate.post.ts
- server/api/telemetry/errors.post.ts
- server/middleware/canonical-path.ts
- server/middleware/request-id.ts
- server/plugins/error-capture.ts
- server/routes/healthz.get.ts
- server/routes/readyz.get.ts
- server/routes/robots.txt.ts
- server/routes/sitemap.xml.ts
- server/utils/client-ip.ts
- server/utils/logger.ts
- server/utils/rate-limit.ts
- server/utils/revalidate.ts
- server/utils/seo.ts

## 代码-文档对齐说明

- 「revalidate 503 未指 runtimeConfig」→ `docs/deployment.md` 写明 `revalidateSecret` 未设则 503
- 「SCSS token 无头注释」→ tokens/patterns 六文件补【文件职责】

## 文档变更

- docs/deployment.md → runtimeConfig.revalidateSecret 503 说明

## 注释变更

- SCSS tokens/patterns 六文件【文件职责】头注释
- server/api/revalidate.post.ts: 503/401/400 分支
- server/routes/robots.txt.ts、sitemap.xml.ts: 动态 SEO 路由
- server/utils/revalidate.ts、seo.ts

## doc-claims 证据（本批源码关联 5 条）

| claim           | 文档                                  | evidenceHint                                                                                                                         |
| --------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| dataflow-008    | `docs-site/architecture/data-flow.md` | nuxt.config.ts:3 (revalidateSecret)                                                                                                  |
| seo-001         | `docs-site/architecture/seo.md`       | config/site.ts:4 (PUBLIC_PAGE_PATHS); config/routes.ts:12 (isProductPath)                                                            |
| overview-002    | `docs-site/architecture/overview.md`  | app/middleware/locale.global.ts:16 (localizedProductPathToCanonical); app/middleware/locale.global.ts:4 (resolveLocaleRouteDecision) |
| env-002         | `docs-site/deployment/env.md`         | server/api/revalidate.post.ts:49 (revalidateSecret)                                                                                  |
| docs-deploy-002 | `docs/deployment.md`                  | server/api/revalidate.post.ts:49 (revalidateSecret)                                                                                  |

## 代码-文档不一致项

- 无（以代码为准；上表 claim 均已 enrich 行号校验）

## 完成标准

- [x] 已读文件数量 = 25
- [x] doc-claims 关联符号可在源码定位（见上表 evidenceHint）
- [x] `pnpm docs:sync:check --batch 7`
