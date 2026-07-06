<!--
  【编辑器页】

  路由：/docs/:id、/docs/new（:id 为 workspace 项目 id）
  Layout：editor | 鉴权：auth 中间件 | key：workspace-editor

  页面职责（薄包装层）：
  - 解析路由 id，区分新建（/docs/new）与编辑（/docs/:id）
  - 加载 workspace 项目元数据，传递给 EditorWorkspace
  - 管理 cachedProject 缓存，避免路由切换时闪烁

  用户流程：
  - 新建：/docs/new → EditorWorkspace 首次保存时 createWorkspaceProject → replace 到 /docs/:id
  - 编辑：/docs/:id → fetchWorkspaceProject → 加载 documentId → 编辑器渲染并自动保存
  - 标题修改、返回工作台等交互在 EditorWorkspace 内完成

  数据 / API：
  - fetchWorkspaceProject(id)：获取项目（无 documentId 则 404）
  - EditorWorkspace 内部：fetchEditorDocument / saveEditorDocument / createWorkspaceProject / updateWorkspaceProject

  子组件：
  - EditorWorkspace（app/features/editor）
    - EditorWorkspaceHeader：返回工作台、可编辑标题、自动保存状态
    - YanivEditor（@yanivjs/yaniv-editor）：PPT 编辑器，2s debounce 自动保存

  SEO / 边界：
  - noindex
  - 编辑模式 pending 且无缓存时显示全屏 loading
  - 项目不存在或 API 失败 → createError（404/500）
  - project-created / project-updated 事件同步更新 cachedProject 与 SEO title
-->
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { getApiErrorMessage } from '~/lib/http/error'
import { EditorWorkspace } from '~/features/editor'
import {
  fetchWorkspaceProject,
  getWorkspaceDocPath,
  getWorkspaceNewDocPath,
  isNewWorkspaceProjectId,
  type WorkspaceProject
} from '~/features/workspace'

definePageMeta({
  layout: 'editor',
  middleware: 'auth',
  key: 'workspace-editor'
})

const route = useRoute()
const languageStore = useLanguageStore()
const { t } = useI18n()

const routeId = computed(() => {
  const id = route.params.id
  return String(Array.isArray(id) ? id[0] : id)
})

const isNewDraft = computed(() => isNewWorkspaceProjectId(routeId.value))

const {
  data: project,
  error,
  pending
} = await useAsyncData(
  () => `workspace-project:${routeId.value}`,
  async () => {
    if (isNewWorkspaceProjectId(routeId.value)) {
      return null
    }

    const response = await fetchWorkspaceProject(routeId.value)
    const fetchedProject = response.data.project

    if (!fetchedProject.documentId) {
      throw createError({
        statusCode: 404,
        statusMessage: t('workspace.projectNotFound')
      })
    }

    return fetchedProject
  },
  { watch: [routeId] }
)

if (!isNewDraft.value && error.value) {
  const cause = error.value.cause ?? error.value
  const fetchError = cause as { statusCode?: number; response?: { status?: number } }

  throw createError({
    statusCode: fetchError.statusCode || fetchError.response?.status || 500,
    statusMessage: getApiErrorMessage(cause, t('workspace.projectNotFound'))
  })
}

const cachedProject = ref<WorkspaceProject | null>(null)

watch(project, (nextProject) => {
  if (nextProject) {
    cachedProject.value = nextProject
  }
})

const resolvedProject = computed(() => project.value ?? cachedProject.value)
const editorDocumentId = computed(() => resolvedProject.value?.documentId ?? null)

const onProjectCreated = (createdProject: WorkspaceProject) => {
  cachedProject.value = createdProject
}

const onProjectUpdated = (patch: Pick<WorkspaceProject, 'id' | 'title'>) => {
  if (cachedProject.value?.id === patch.id) {
    cachedProject.value = {
      ...cachedProject.value,
      title: patch.title
    }
  }
}

usePageSeo({
  path: isNewDraft.value ? getWorkspaceNewDocPath() : getWorkspaceDocPath(routeId.value),
  locale: languageStore.currentLanguage,
  title: isNewDraft.value
    ? `${t('workspace.defaultTitle')} · ${t('workspace.edit')}`
    : `${project.value?.title ?? t('workspace.defaultTitle')} · ${t('workspace.edit')}`,
  description: project.value?.description ?? project.value?.title ?? t('workspace.defaultTitle'),
  noindex: true
})
</script>

<template>
  <div v-if="pending && !isNewDraft && !cachedProject" class="editor-page-loading">
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
