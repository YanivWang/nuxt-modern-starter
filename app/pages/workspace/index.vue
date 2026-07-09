<!--
  【工作台】

  【文件职责】
    项目列表薄页：委托 WorkspaceDashboard 渲染列表、创建与删除交互。

  【架构位置】
    登录产品区 — app/pages/workspace，product layout，语言中性 URL /workspace。

  路由：/workspace（语言中性 URL，不带 /en 前缀）
  Layout：product | 鉴权：app/middleware/auth.ts | 渲染：CSR

  UI 区块（由 WorkspaceDashboard 渲染）：
  - 页头：标题 +「创建项目」主按钮
  - 加载态：a-spin
  - 空态：a-empty（无项目时）
  - 项目网格：WorkspaceProjectCard 卡片（预览缩略图、标题、更新时间、操作菜单）

  用户流程：
  - 登录后进入 → 查看项目列表
  - 点击「创建项目」按钮 → 跳转 /docs/new
  - 点击项目卡片 → 跳转 /docs/:id
  - 删除项目 → 确认后调用 API → 刷新列表

  【依赖关系】
  - 依赖：~/features/workspace WorkspaceDashboard、workspace api adapter
  - 被引用：sign-in 默认 redirect、AppHeader 已登录 CTA、product-shell 侧边栏

  【渲染 / 数据】
    CSR + noindex；adapter /projects、DELETE /projects/:id（Product API client，base 已含 /api）。
    getWorkspaceNewDocPath → /docs/new；getWorkspaceDocPath(id) → /docs/:id。

  子组件：
  - WorkspaceDashboard（app/features/workspace）
  - WorkspaceProjectCard

  【边界与注意】
    仅「创建项目」按钮进入 /docs/new，无空白卡片创建入口。
    /en/workspace 由 locale / server middleware 301 到 /workspace。
-->
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { WorkspaceDashboard } from '~/features/workspace'

// CSR 产品页；列表/创建/删除逻辑在 WorkspaceDashboard + composables
definePageMeta({
  layout: 'product',
  middleware: 'auth'
})

const languageStore = useLanguageStore()
const { t } = useI18n()

usePageSeo({
  path: '/workspace',
  locale: languageStore.currentLanguage,
  title: t('workspace.title'),
  description: t('workspace.title'),
  noindex: true
})
</script>

<template>
  <WorkspaceDashboard />
</template>
