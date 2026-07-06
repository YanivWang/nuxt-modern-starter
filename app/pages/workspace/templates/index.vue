<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import ThemeTemplatesPage from '~/features/templates/components/ThemeTemplatesPage.vue'

definePageMeta({
  layout: 'product',
  middleware: 'auth'
})

const languageStore = useLanguageStore()
const { t } = useI18n()

usePageSeo({
  path: '/workspace/templates',
  locale: languageStore.currentLanguage,
  title: t('productNav.themeTemplates'),
  description: t('templates.empty'),
  noindex: true
})
</script>

<template>
  <ThemeTemplatesPage />
</template>
