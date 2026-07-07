<!--
  【工作台】

  路由：/workspace（语言中性 URL，不带 /en 前缀）
  Layout：product | 鉴权：auth 中间件 | 渲染：CSR

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

  数据 / API：
  - fetchWorkspaceProjects()：加载项目列表
  - deleteWorkspaceProject(id)：删除项目
  - getWorkspaceNewDocPath() → /docs/new
  - getWorkspaceDocPath(id) → /docs/:id

  子组件：
  - WorkspaceDashboard（app/features/workspace）
  - WorkspaceProjectCard

  SEO / 边界：
  - noindex；登录页默认 redirect 目标；AppHeader（已登录）、product-shell 侧边栏均有入口
-->
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { WorkspaceDashboard } from '~/features/workspace'

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
