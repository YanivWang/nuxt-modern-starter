<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { AccountPage } from '~/features/account'

definePageMeta({
  layout: 'account',
  middleware: 'auth'
})

const languageStore = useLanguageStore()
const { t } = useI18n()

usePageSeo({
  path: '/account',
  locale: languageStore.currentLanguage,
  title: t('auth.account.title'),
  description: t('auth.account.lead'),
  noindex: true
})
</script>

<template>
  <AccountPage />
</template>
