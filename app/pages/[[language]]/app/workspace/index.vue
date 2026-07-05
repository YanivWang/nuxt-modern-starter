<script setup lang="ts">
import { WorkspaceDashboard } from '../../../../features/workspace'
import { useI18n } from 'vue-i18n'

definePageMeta({
  layout: 'product',
  middleware: 'auth'
})

const languageStore = useLanguageStore()
const { t } = useI18n()

usePageSeo({
  path: '/app/workspace',
  locale: languageStore.currentLanguage,
  title: t('workspace.nav'),
  description: t('workspace.lead'),
  noindex: true
})
</script>

<template>
  <WorkspaceDashboard />
</template>
