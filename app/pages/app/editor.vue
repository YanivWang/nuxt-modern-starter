<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { EditorWorkspace } from '~/features/editor'
import { SITE_NAME } from '~~/config/site'

definePageMeta({
  layout: 'editor',
  middleware: 'auth'
})

const route = useRoute()
const { localePath } = useLocalePath()
const { t } = useI18n()

const documentId = computed(() => {
  const raw = route.query.documentId

  if (typeof raw === 'string') {
    return raw
  }

  if (Array.isArray(raw)) {
    return raw[0] ?? null
  }

  return null
})

if (!documentId.value) {
  await navigateTo(localePath('/app/workspace'), { replace: true })
}

useHead({
  title: computed(() => `${t('editor.metaTitle')} · ${SITE_NAME}`),
  meta: [{ name: 'robots', content: 'noindex,nofollow' }]
})
</script>

<template>
  <EditorWorkspace v-if="documentId" :document-id="documentId" />
</template>
