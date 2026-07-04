<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { SITE_NAME } from '../config/site'

const props = defineProps<{
  error: {
    statusCode?: number
    statusMessage?: string
    message?: string
  }
}>()

const { t, te } = useI18n()
const handleError = () => clearError({ redirect: '/' })

const errorTitle = computed(() => {
  const { statusCode, statusMessage } = props.error

  if (statusMessage && te(statusMessage)) {
    return t(statusMessage)
  }

  if (statusCode === 403) {
    return t('error.forbidden')
  }

  if (statusCode === 404) {
    return t('error.title')
  }

  return t('error.title')
})

useHead({
  title: computed(() => `${errorTitle.value} · ${SITE_NAME}`),
  meta: [{ name: 'robots', content: 'noindex,nofollow' }]
})
</script>

<template>
  <NuxtLayout name="empty">
    <main class="error-page">
      <div class="page-empty-state">
        <p class="page-eyebrow">{{ error.statusCode || 500 }}</p>
        <h1 class="page-title">
          {{ errorTitle }}
        </h1>
        <p class="page-lead">{{ t('error.message') }}</p>
        <a-button type="primary" size="large" class="error-page__action" @click="handleError">
          {{ t('common.backHome') }}
        </a-button>
      </div>
    </main>
  </NuxtLayout>
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
}

.error-page__action {
  margin-top: 24px;
  min-width: 160px;
  height: 44px;
  border-radius: 12px;
  font-weight: 600;
}
</style>
