# Batch 2 Report: app/lib/http + app/api

Generated: 2026-07-09（深度审阅 + doc-claims 证据）

## 已读文件（7/7）

- app/api/auth.ts
- app/api/clients.ts
- app/api/public.ts
- app/lib/http/client.ts
- app/lib/http/error.ts
- app/lib/http/headers.ts
- app/lib/http/types.ts

## 代码-文档对齐说明

- 「信封仅描述 JSON 形状」→ 补充 `ApiResponse<T>`、`assertApiSuccess`（`app/lib/http/types.ts`）
- 「NUXT_PUBLIC_API_BASE 拼接」→ 改为 `runtimeConfig.public.apiBase`（已含 `/api` 前缀）
- 「revalidate secret 泛指」→ 明确 `runtimeConfig.revalidateSecret` / `NUXT_REVALIDATE_SECRET`
- 「createProductApiClient 位置模糊」→ `docs/architecture.md` 指向 `app/api/auth.ts`

## 文档变更

- docs-site/tech-stack/http.md → 响应必须符合标准信封并执行 assertApiSuccess
- docs-site/architecture/data-flow.md → refreshAccessTokenOnce 单飞；ApiResponse/assertApiSuccess；apiBase；revalidateSecret
- docs/architecture.md → createProductApiClient 在 auth.ts

## 注释变更

- app/api/auth.ts: refreshAccessTokenOnce 单飞、retryOnUnauthorized 适用 API
- app/lib/http/client.ts: assertApiEnvelope 强制标准信封、401 单次重试

## doc-claims 证据（本批源码关联 13 条）

| claim          | 文档                                   | evidenceHint                                                                                                                              |
| -------------- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| dataflow-001   | `docs-site/architecture/data-flow.md`  | app/lib/http/types.ts:3 (ApiResponse); app/lib/http/types.ts:17 (assertApiSuccess)                                                        |
| dataflow-002   | `docs-site/architecture/data-flow.md`  | app/api/clients.ts:4 (createPublicApiClient); app/api/clients.ts:10 (createAuthApiClient); app/api/clients.ts:20 (createProductApiClient) |
| dataflow-003   | `docs-site/architecture/data-flow.md`  | app/api/auth.ts:4 (createProductApiClient); app/api/auth.ts:4 (refreshAccessTokenOnce)                                                    |
| feature-001    | `docs-site/development/add-feature.md` | app/api/auth.ts:4 (createProductApiClient)                                                                                                |
| overview-001   | `docs-site/architecture/overview.md`   | app/api/auth.ts:4 (createProductApiClient); app/api/auth.ts:27 (createAuthApiClient)                                                      |
| index-001      | `docs-site/index.md`                   | config/content/faq.ts:10 (faqItems); config/content/faq.ts:14 (getFaqItems)                                                               |
| addapi-001     | `docs-site/development/add-api.md`     | app/api/clients.ts:4 (createPublicApiClient)                                                                                              |
| addapi-002     | `docs-site/development/add-api.md`     | app/api/auth.ts:4 (createProductApiClient)                                                                                                |
| ts-ov-002      | `docs-site/tech-stack/overview.md`     | app/lib/http/types.ts:3 (ApiResponse)                                                                                                     |
| http-doc-001   | `docs-site/tech-stack/http.md`         | app/lib/http/client.ts:35 (assertApiEnvelope); app/lib/http/client.ts:23 (assertApiSuccess)                                               |
| http-doc-002   | `docs-site/tech-stack/http.md`         | app/api/auth.ts:4 (createProductApiClient)                                                                                                |
| docs-conv-001  | `docs/conventions.md`                  | app/api/auth.ts:4 (createProductApiClient)                                                                                                |
| docs-usage-002 | `docs/usage.md`                        | app/api/public.ts:10 (getFaqItems); app/api/public.ts:24 (faqItems)                                                                       |

## 代码-文档不一致项

- 无（以代码为准；上表 claim 均已 enrich 行号校验）

## 完成标准

- [x] 已读文件数量 = 7
- [x] doc-claims 关联符号可在源码定位（见上表 evidenceHint）
- [x] `pnpm docs:sync:check --batch 2`
