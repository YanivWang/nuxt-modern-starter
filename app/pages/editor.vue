<script setup lang="ts">
import { YanivEditor } from '@yanivjs/yaniv-editor'
import '@yanivjs/yaniv-editor/style.css'

definePageMeta({
  layout: 'empty',
  middleware: 'auth'
})

useHead({
  title: 'Editor · Nuxt Modern Starter',
  meta: [{ name: 'robots', content: 'noindex,nofollow' }]
})

const content = ref('')
</script>

<template>
  <div class="editor-page">
    <ClientOnly>
      <YanivEditor v-model="content" placeholder="开始撰写你的内容..." />
      <template #fallback>
        <div class="editor-page__loading">
          <a-spin />
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<style scoped lang="scss">
.editor-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 24px;
  background: var(--app-color-bg);
}

.editor-page__loading {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
}
</style>
