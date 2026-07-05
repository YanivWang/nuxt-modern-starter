<script setup lang="ts">
import { useI18n } from 'vue-i18n'
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
const { data: project } = await useAsyncData(`workspace-project:${projectId}`, async () => {
  const response = await fetchWorkspaceProject(String(projectId))
  return response.data.project
})

if (!project.value || !project.value.documentId) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Project not found'
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
