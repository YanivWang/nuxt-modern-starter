<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { getApiErrorMessage } from '~/api-core/api-error'
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
