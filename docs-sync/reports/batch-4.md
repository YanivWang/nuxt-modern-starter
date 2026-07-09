# Batch 4 Report: stores + layouts + components + app-root

Generated: 2026-07-09（深度审阅 + doc-claims 证据）

## 已读文件（21/21）

- app/app.vue
- app/components/base/AppContainer.vue
- app/components/base/BaseButton.vue
- app/components/base/BaseLogo.vue
- app/components/base/BasePicture.vue
- app/components/base/PageContainer.vue
- app/components/layout/AppFooter.vue
- app/components/layout/AppHeader.vue
- app/components/layout/AppShellHeader.vue
- app/components/layout/LanguageSwitcher.vue
- app/components/layout/ThemeSwitch.vue
- app/components/layout/UserAccountMenu.vue
- app/error.vue
- app/layouts/account.vue
- app/layouts/default.vue
- app/layouts/editor.vue
- app/layouts/empty.vue
- app/layouts/product.vue
- app/stores/auth.ts
- app/stores/language.ts
- app/stores/theme.ts

## 旧说法 → 新说法（文档漂移修正）

- 「config 目录缺 antd-locale」→ directory.md 配置表补 `config/antd-locale.ts`
- 「Base 组件无职责说明」→ BaseButton/BaseLogo/BasePicture 补内联注释与头注释

## 文档变更

- docs-site/architecture/directory.md → config 表补充 antd-locale、theme-palette

## 注释变更

- UserAccountMenu.vue: 触控/桌面语言面板、产品区 switchLanguage 不改 URL
- LanguageSwitcher.vue: 公开页 switchLocalePath 改 URL
- AppHeader.vue、ThemeSwitch.vue、AppFooter.vue
- BaseButton.vue、BaseLogo.vue、BasePicture.vue、PageContainer.vue
- app/app.vue: theme-init FOUC、AntD locale 竞态丢弃
- app/stores/auth.ts、stores/language.ts

## doc-claims 证据（本批源码关联 1 条）

| claim     | 文档                            | evidenceHint                                   |
| --------- | ------------------------------- | ---------------------------------------------- |
| pinia-001 | `docs-site/tech-stack/pinia.md` | app/stores/auth.ts:35 (clearAttributionParams) |

## 代码-文档不一致项

- 无（以代码为准；上表 claim 均已 enrich 行号校验）

## 完成标准

- [x] 已读文件数量 = 21
- [x] doc-claims 关联符号可在源码定位（见上表 evidenceHint）
- [x] `pnpm docs:sync:check --batch 4`
