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
    <div class="page-empty-state">
      <p class="page-eyebrow">404</p>
      <h1 class="page-title">{{ $t('error.title') }}</h1>
      <p class="page-lead">{{ $t('error.message') }}</p>
      <NuxtLink :to="localePath('/')" class="page-back-link">
        {{ $t('common.backHome') }}
      </NuxtLink>
    </div>
  </PageContainer>
</template>

<style scoped lang="scss">
.page-empty-state {
  .page-title {
    font-size: clamp(28px, 4vw, 40px);
  }

  .page-lead {
    margin-top: 16px;
    font-size: 16px;
  }

  .page-back-link {
    margin-top: 24px;
  }
}
</style>
