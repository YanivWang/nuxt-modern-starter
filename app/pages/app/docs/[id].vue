<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { getApiErrorMessage } from '~/api-core/api-error'
import { EditorWorkspace } from '~/features/editor'
import {
  fetchWorkspaceProject,
  getWorkspaceDocPath,
  type WorkspaceProject
} from '~/features/workspace'

definePageMeta({
  layout: 'editor',
  middleware: 'auth'
})

const route = useRoute()
const languageStore = useLanguageStore()
const { t } = useI18n()
const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id

const { data: project, error } = await useAsyncData(`workspace-project:${id}`, async () => {
  const response = await fetchWorkspaceProject(String(id))
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
  path: getWorkspaceDocPath(resolvedProject.value.id),
  locale: languageStore.currentLanguage,
  title: `${resolvedProject.value.title} · ${t('workspace.edit')}`,
  description: resolvedProject.value.description ?? resolvedProject.value.title,
  noindex: true
})
</script>

<template>
  <EditorWorkspace :document-id="editorDocumentId" :project="resolvedProject" />
</template>
