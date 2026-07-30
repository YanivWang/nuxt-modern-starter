# Batch 5 Report: pages + feature-workspace + feature-editor

Generated: 2026-07-30（深度审阅 + doc-claims 证据）

## 已读文件（40/40）

- app/features/editor/api.ts
- app/features/editor/components/EditorWorkspace.vue
- app/features/editor/components/EditorWorkspaceHeader.vue
- app/features/editor/composables/editor-content.ts
- app/features/editor/composables/useDraftProject.ts
- app/features/editor/composables/useEditorAutosave.ts
- app/features/editor/composables/useEditorDocument.ts
- app/features/editor/composables/useEditorMediaUpload.ts
- app/features/editor/composables/useEditorPage.ts
- app/features/editor/composables/useEditorTitle.ts
- app/features/editor/composables/useEditorWorkspace.ts
- app/features/editor/editor-appearance.ts
- app/features/editor/index.ts
- app/features/editor/types.ts
- app/features/editor/upload-api.ts
- app/features/editor/upload/compute-file-md5.ts
- app/features/editor/upload/compute-file-md5.worker.ts
- app/features/editor/upload/constants.ts
- app/features/editor/upload/large-upload-persistence.ts
- app/features/editor/upload/resolve-upload-url.ts
- app/features/editor/upload/types.ts
- app/features/editor/upload/useLargeFileUpload.ts
- app/features/workspace/components/WorkspaceDashboard.vue
- app/features/workspace/components/WorkspaceProjectCard.vue
- app/features/workspace/composables/useWorkspaceProjects.ts
- app/features/workspace/composables/workspace-project-delete.ts
- app/features/workspace/index.ts
- app/pages/[[language]]/[...slug].vue
- app/pages/[[language]]/about.vue
- app/pages/[[language]]/help.vue
- app/pages/[[language]]/index.vue
- app/pages/[[language]]/news/[slug].vue
- app/pages/[[language]]/news/index.vue
- app/pages/[[language]]/pricing.vue
- app/pages/[[language]]/sign-in.vue
- app/pages/[[language]]/sign-up.vue
- app/pages/account.vue
- app/pages/docs/[id].vue
- app/pages/workspace/index.vue
- app/pages/workspace/templates/index.vue

## 代码-文档对齐说明

- 「/docs/new 仅写首次保存创建」→ 补充 `WORKSPACE_NEW_PROJECT_ID`、`ensureDraftProject` 草稿流程
- 「2s 自动保存无常量名」→ `EDITOR_AUTOSAVE_DEBOUNCE_MS` = 2000 写入 routing/deployment/index
- 「测试规模 23/84」→ **32 文件 / 116 用例**（含 `doc-claims.test.ts`，与 `pnpm test` 一致）

## 文档变更

- docs-site/development/add-feature.md → workspace idle 预加载 editor
- docs-site/architecture/routing.md → WORKSPACE_NEW_PROJECT_ID、ensureDraftProject、EDITOR_AUTOSAVE_DEBOUNCE_MS
- docs-site/deployment/overview.md → 联调表补充草稿/自动保存符号
- docs-site/index.md → EDITOR_AUTOSAVE_DEBOUNCE_MS

## 注释变更

- pages/index.vue: WebPage + Organization JSON-LD
- pages/help.vue、about.vue、[...slug].vue 404
- pages/pricing.vue、news/*、sign-in/sign-up、docs/[id].vue
- editor/workspace composables 状态机
- WorkspaceDashboard.vue: idle 预加载 editor route

## doc-claims 证据（本批源码关联 8 条）

| claim         | 文档                                   | evidenceHint                                                                                                                                                                                                             |
| ------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| routing-009   | `docs-site/architecture/routing.md`    | app/api/workspace-project.ts:11 (WORKSPACE_NEW_PROJECT_ID); app/features/editor/composables/useDraftProject.ts:58 (ensureDraftProject)                                                                                   |
| routing-010   | `docs-site/architecture/routing.md`    | app/features/editor/types.ts:13 (EDITOR_AUTOSAVE_DEBOUNCE_MS)                                                                                                                                                            |
| dataflow-006  | `docs-site/architecture/data-flow.md`  | app/features/editor/api.ts:9 (fetchEditorDocument); app/features/editor/api.ts:9 (saveEditorDocument)                                                                                                                    |
| arch-002      | `docs/architecture.md`                 | app/features/editor/types.ts:13 (EDITOR_AUTOSAVE_DEBOUNCE_MS); app/features/editor/composables/useEditorWorkspace.ts:116 (flushAutosave); app/features/editor/composables/useEditorWorkspace.ts:156 (onBeforeRouteLeave) |
| deploy-002    | `docs-site/deployment/overview.md`     | app/api/workspace-project.ts:11 (WORKSPACE_NEW_PROJECT_ID); app/features/editor/types.ts:13 (EDITOR_AUTOSAVE_DEBOUNCE_MS)                                                                                                |
| feature-002   | `docs-site/development/add-feature.md` | app/features/workspace/components/WorkspaceDashboard.vue:42 (preloadRouteComponents); app/features/workspace/components/WorkspaceDashboard.vue:36 (prefetchEditorRoute)                                                  |
| directory-002 | `docs-site/architecture/directory.md`  | app/features/product-shell/config.ts:10 (productNavItems)                                                                                                                                                                |
| index-002     | `docs-site/index.md`                   | app/features/editor/types.ts:13 (EDITOR_AUTOSAVE_DEBOUNCE_MS)                                                                                                                                                            |

## 代码-文档不一致项

- 无（以代码为准；上表 claim 均已 enrich 行号校验）

## 完成标准

- [x] 已读文件数量 = 40
- [x] doc-claims 关联符号可在源码定位（见上表 evidenceHint）
- [x] `pnpm docs:sync:check --batch 5`
