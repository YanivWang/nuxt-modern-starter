<!--
  【编辑器页】

  【文件职责】
    文档编辑薄页：解析 :id，加载 workspace 项目元数据，挂载 EditorWorkspace。

  【架构位置】
    登录产品区 — app/pages/docs/[id].vue，editor layout，语言中性 URL /docs/:id、/docs/new。

  路由：/docs/:id、/docs/new（:id 为 workspace 项目 id，新建 id='new'）
  Layout：editor | 鉴权：app/middleware/auth.ts | key：workspace-editor

  【依赖关系】
  - 依赖：~/features/editor EditorWorkspace、useEditorPage
  - 被引用：workspace 列表 / 创建按钮

  【渲染 / 数据】
    CSR + noindex；项目元数据与编辑器会话分别由 useEditorPage / useEditorWorkspace 管理。
-->
<script setup lang="ts">
import { EditorWorkspace, useEditorPage } from '~/features/editor'

// editor layout + auth middleware；key 固定避免 /docs/:id 切换时整页 remount 丢编辑器状态
definePageMeta({
  layout: 'editor',
  middleware: 'auth',
  key: 'workspace-editor'
})

const { showLoading, editorDocumentId, resolvedProject, onProjectCreated, onProjectUpdated } =
  useEditorPage()
</script>

<template>
  <div v-if="showLoading" class="editor-page-loading">
    <a-spin />
  </div>
  <EditorWorkspace
    v-else
    :document-id="editorDocumentId"
    :project="resolvedProject"
    @project-created="onProjectCreated"
    @project-updated="onProjectUpdated"
  />
</template>

<style scoped lang="scss">
.editor-page-loading {
  display: grid;
  min-height: 100vh;
  place-items: center;
}
</style>
