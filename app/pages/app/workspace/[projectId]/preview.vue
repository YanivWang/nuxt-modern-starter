<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { getApiErrorMessage } from '~/api-core/api-error'
import { fetchEditorDocument } from '~/apis/editor'
import { ProjectPreviewPlaceholder, fetchWorkspaceProject } from '~/features/workspace'
import type { WorkspaceProject } from '~/features/workspace'

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

const { data: project, error: projectError } = await useAsyncData(
  `workspace-project-preview:${projectId}`,
  async () => {
    const response = await fetchWorkspaceProject(String(projectId))
    return response.data.project
  }
)

if (projectError.value) {
  const cause = projectError.value.cause ?? projectError.value
  const fetchError = cause as { statusCode?: number; response?: { status?: number } }

  throw createError({
    statusCode: fetchError.statusCode || fetchError.response?.status || 500,
    statusMessage: getApiErrorMessage(cause, t('workspace.projectNotFound'))
  })
}

if (!project.value) {
  throw createError({
    statusCode: 404,
    statusMessage: t('workspace.projectNotFound')
  })
}

const resolvedProject = computed(() => project.value as WorkspaceProject)

const { data: document, pending: documentPending } = await useAsyncData(
  `workspace-document-preview:${projectId}`,
  async () => {
    if (!project.value?.documentId) {
      return null
    }

    const response = await fetchEditorDocument(project.value.documentId)
    return response.data.document
  }
)

usePageSeo({
  path: `/app/workspace/${resolvedProject.value.id}/preview`,
  locale: languageStore.currentLanguage,
  title: `${resolvedProject.value.title} · ${t('workspace.preview')}`,
  description: resolvedProject.value.description ?? resolvedProject.value.title,
  noindex: true
})
</script>

<template>
  <ProjectPreviewPlaceholder
    :project="resolvedProject"
    :document="document"
    :pending="documentPending"
  />
</template>
