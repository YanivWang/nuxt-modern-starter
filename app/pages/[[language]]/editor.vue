<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { YanivEditor } from '@yanivjs/yaniv-editor'
import '@yanivjs/yaniv-editor/style.css'
import { SITE_NAME } from '../../../config/site'

definePageMeta({
  layout: 'empty',
  middleware: 'auth'
})

const { t } = useI18n()
const content = ref('')

useHead({
  title: computed(() => `${t('editor.metaTitle')} · ${SITE_NAME}`),
  meta: [{ name: 'robots', content: 'noindex,nofollow' }]
})
</script>

<template>
  <div class="editor-page">
    <header class="editor-page__header">
      <p class="editor-page__eyebrow">{{ $t('editor.eyebrow') }}</p>
      <h1 class="editor-page__title">{{ $t('editor.title') }}</h1>
    </header>

    <div class="editor-page__surface">
      <ClientOnly>
        <YanivEditor v-model="content" :placeholder="$t('editor.placeholder')" />
        <template #fallback>
          <div class="editor-page__loading">
            <a-spin />
          </div>
        </template>
      </ClientOnly>
    </div>
  </div>
</template>

<style scoped lang="scss">
.editor-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: clamp(20px, 4vw, 32px);
  background:
    radial-gradient(circle at 18% 18%, rgb(22 119 255 / 10%), transparent 34%), var(--app-color-bg);
}

.editor-page__header {
  flex-shrink: 0;
  margin-bottom: 20px;
}

.editor-page__eyebrow {
  margin: 0 0 8px;
  color: var(--app-color-primary);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.editor-page__title {
  margin: 0;
  font-size: clamp(22px, 3vw, 28px);
  letter-spacing: -0.03em;
}

.editor-page__surface {
  display: flex;
  flex: 1;
  min-height: 0;
  padding: clamp(16px, 3vw, 24px);
  border: 1px solid var(--app-color-border);
  border-radius: 24px;
  background: var(--app-color-bg);
  box-shadow: 0 12px 32px rgb(15 23 42 / 5%);
}

.editor-page__loading {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
}
</style>
