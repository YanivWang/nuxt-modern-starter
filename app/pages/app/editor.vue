<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { EditorWorkspace } from '~/features/editor'
import { SITE_NAME } from '~~/config/site'

definePageMeta({
  layout: 'editor',
  middleware: 'auth'
})

const { t } = useI18n()

useHead({
  title: computed(() => `${t('editor.metaTitle')} · ${SITE_NAME}`),
  meta: [{ name: 'robots', content: 'noindex,nofollow' }]
})
</script>

<template>
  <EditorWorkspace />
</template>
