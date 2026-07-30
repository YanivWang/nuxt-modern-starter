# Batch 8 Report: docker + vitest.config + doc-review

Generated: 2026-07-30（深度审阅 + doc-claims 证据）

## 已读文件（5/5）

- docker/docker-compose.base.yaml
- docker/docker-compose.dev.yaml
- docker/docker-compose.yaml
- docker/nginx/gateway.docker.conf
- vitest.config.ts

## 代码-文档对齐说明

- 「Vitest 仅写 nuxt 环境」→ `defineVitestConfig` + `include: tests/**/*.{test,spec}.ts`
- 「Article SEO 缺实现函数名」→ `buildPageSeoScripts`（`usePageSeo.ts`）
- 「quality 未列 docs:sync」→ README/scripts 补 `docs:sync:check`、`docs:sync:enrich`
- 「ApiResponse 仅在 http.md」→ tech-stack/overview 后端契约节补类型名

## 文档变更

- README.md → docs:sync:check、docs:sync:enrich
- docs-site/guide/overview.md → vitest.config.ts include；productRoutePatterns/csrRouteRules
- docs-site/development/testing.md → defineVitestConfig、environment
- docs-site/development/add-seo.md → buildPageSeoScripts
- docs-site/tech-stack/overview.md → ApiResponse 类型

## 注释变更

- vitest.config.ts: environment nuxt、include 范围
- docker-compose.base.yaml: healthcheck 供 gateway depends_on
- docker-compose.yaml: gateway 等 nuxt healthy 后暴露
- README 补充 docs:sync:check / docs:sync:enrich

## doc-claims 证据（本批源码关联 4 条）

| claim        | 文档                               | evidenceHint                                                              |
| ------------ | ---------------------------------- | ------------------------------------------------------------------------- |
| guide-ov-001 | `docs-site/guide/overview.md`      | vitest.config.ts:19 (include)                                             |
| test-001     | `docs-site/development/testing.md` | vitest.config.ts:9 (defineVitestConfig); vitest.config.ts:3 (environment) |
| nginx-001    | `docs-site/deployment/nginx.md`    | docker/nginx/gateway.docker.conf:2 (/_nuxt/)                              |
| nginx-002    | `docs-site/deployment/nginx.md`    | docker/nginx/gateway.docker.conf:8 (proxy_pass)                           |

## 代码-文档不一致项

- 无（以代码为准；上表 claim 均已 enrich 行号校验）

## 完成标准

- [x] 已读文件数量 = 5
- [x] doc-claims 关联符号可在源码定位（见上表 evidenceHint）
- [x] `pnpm docs:sync:check --batch 8`
