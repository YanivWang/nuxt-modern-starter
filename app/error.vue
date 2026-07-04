<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  error: {
    statusCode?: number
    statusMessage?: string
    message?: string
  }
}>()

const { t } = useI18n()
const handleError = () => clearError({ redirect: '/' })

useHead({
  title: `${props.error.statusCode || 500} · Nuxt Modern Starter`,
  meta: [{ name: 'robots', content: 'noindex,nofollow' }]
})
</script>

<template>
  <NuxtLayout name="empty">
    <main class="error-page">
      <p class="page-eyebrow">{{ error.statusCode || 500 }}</p>
      <h1 class="page-title">
        {{ error.statusMessage || error.message || t('error.title') }}
      </h1>
      <p class="page-lead">{{ t('error.message') }}</p>
      <a-button type="primary" @click="handleError">{{ t('common.backHome') }}</a-button>
    </main>
  </NuxtLayout>
</template>

<style scoped lang="scss">
.error-page {
  min-height: 100vh;
  padding: clamp(72px, 12vw, 140px) clamp(20px, 6vw, 80px);
  background: var(--app-color-bg);
}
</style>
