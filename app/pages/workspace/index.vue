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
