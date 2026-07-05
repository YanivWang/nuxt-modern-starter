<script setup lang="ts">
import { ProjectPreviewPlaceholder, fetchWorkspaceProject } from '~/features/workspace'
import type { WorkspaceProject } from '~/features/workspace'
import { useI18n } from 'vue-i18n'

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
const { data: project } = await useAsyncData(`workspace-project-preview:${projectId}`, async () => {
  const response = await fetchWorkspaceProject(String(projectId))
  return response.data.project
})

if (!project.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Project not found'
  })
}

const resolvedProject = computed(() => project.value as WorkspaceProject)

usePageSeo({
  path: `/app/workspace/${resolvedProject.value.id}/preview`,
  locale: languageStore.currentLanguage,
  title: `${resolvedProject.value.title} · ${t('workspace.preview')}`,
  description: resolvedProject.value.description ?? resolvedProject.value.title,
  noindex: true
})
</script>

<template>
  <ProjectPreviewPlaceholder :project="resolvedProject" />
</template>
