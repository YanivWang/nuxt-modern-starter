<script setup lang="ts">
const props = defineProps<{
  error: {
    statusCode?: number
    statusMessage?: string
    message?: string
  }
}>()

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
        {{ error.statusMessage || error.message || 'Something went wrong' }}
      </h1>
      <p class="page-lead">This page is intentionally excluded from sitemap output.</p>
      <a-button type="primary" @click="handleError">Back home</a-button>
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
