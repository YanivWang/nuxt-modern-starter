<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const languageStore = useLanguageStore()
const { localePath } = useLocalePath()
const { t } = useI18n()

setResponseStatus(404)

usePageSeo({
  path: useRoute().path,
  locale: languageStore.currentLanguage,
  title: t('error.title'),
  description: t('error.message'),
  noindex: true
})
</script>

<template>
  <PageContainer>
    <p class="page-eyebrow">404</p>
    <h1 class="page-title">{{ $t('error.title') }}</h1>
    <p class="page-lead">{{ $t('error.message') }}</p>
    <NuxtLink :to="localePath('/')">{{ $t('common.backHome') }}</NuxtLink>
  </PageContainer>
</template>
