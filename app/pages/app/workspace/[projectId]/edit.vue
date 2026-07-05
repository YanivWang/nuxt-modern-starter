<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { getApiErrorMessage } from '~/api-core/api-error'
import { EditorWorkspace } from '~/features/editor'
import { fetchWorkspaceProject, type WorkspaceProject } from '~/features/workspace'

definePageMeta({
  layout: 'product',
  middleware: 'auth'
})

const route = useRoute()
const languageStore = useLanguageStore()
const { t } = useI18n()
const projectId = Array.isArray(route.params.projectId)
  ? route.params.projectId[0]
  : route.params.projectId

const { data: project, error } = await useAsyncData(`workspace-project:${projectId}`, async () => {
  const response = await fetchWorkspaceProject(String(projectId))
  return response.data.project
})

if (error.value) {
  const cause = error.value.cause ?? error.value
  const fetchError = cause as { statusCode?: number; response?: { status?: number } }

  throw createError({
    statusCode: fetchError.statusCode || fetchError.response?.status || 500,
    statusMessage: getApiErrorMessage(cause, t('workspace.projectNotFound'))
  })
}

if (!project.value?.documentId) {
  throw createError({
    statusCode: 404,
    statusMessage: t('workspace.projectNotFound')
  })
}

const resolvedProject = computed(() => project.value as WorkspaceProject)
const editorDocumentId = computed(() => resolvedProject.value.documentId)

usePageSeo({
  path: `/app/workspace/${resolvedProject.value.id}/edit`,
  locale: languageStore.currentLanguage,
  title: `${resolvedProject.value.title} · ${t('workspace.edit')}`,
  description: resolvedProject.value.description ?? resolvedProject.value.title,
  noindex: true
})
</script>

<template>
  <EditorWorkspace :document-id="editorDocumentId" />
</template>
