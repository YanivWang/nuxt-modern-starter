<script setup lang="ts">
import {
  ProjectPreviewPlaceholder,
  getWorkspaceProjectById
} from '../../../../../features/workspace'
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
const project = getWorkspaceProjectById(String(projectId))

if (!project) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Project not found'
  })
}

usePageSeo({
  path: `/app/workspace/${project.id}/preview`,
  locale: languageStore.currentLanguage,
  title: `${project.title} · ${t('workspace.preview')}`,
  description: project.description,
  noindex: true
})
</script>

<template>
  <ProjectPreviewPlaceholder :project="project" />
</template>
