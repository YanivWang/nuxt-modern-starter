# Batch 6 Report: feature-account + product-shell + templates

Generated: 2026-09-05（深度审阅 + doc-claims 证据）

## 已读文件（10/10）

- app/features/account-shell/components/AccountShell.vue
- app/features/account-shell/config.ts
- app/features/account-shell/index.ts
- app/features/account/components/AccountPage.vue
- app/features/account/index.ts
- app/features/product-shell/components/ProductShell.vue
- app/features/product-shell/config.ts
- app/features/product-shell/index.ts
- app/features/templates/components/ThemeTemplatesPage.vue
- app/features/templates/index.ts

## 代码-文档对齐说明

- 「product-shell 与 account-shell 混述」→ 分拆 footer/nav 职责；product-shell footer 链公开定价页

## 文档变更

- 本批关联 doc-claims 已核对，文档正文无漂移需修改

## 注释变更

- product-shell/config.ts: footer 定价链公开页
- ProductShell.vue: navIconMap 与 localePath
- AccountShell.vue: 与 product-shell 职责分离

## doc-claims 证据（本批源码关联 1 条）

| claim         | 文档                                  | evidenceHint                                              |
| ------------- | ------------------------------------- | --------------------------------------------------------- |
| directory-002 | `docs-site/architecture/directory.md` | app/features/product-shell/config.ts:10 (productNavItems) |

## 代码-文档不一致项

- 无（以代码为准；上表 claim 均已 enrich 行号校验）

## 完成标准

- [x] 已读文件数量 = 10
- [x] doc-claims 关联符号可在源码定位（见上表 evidenceHint）
- [x] `pnpm docs:sync:check --batch 6`
