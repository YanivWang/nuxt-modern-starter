<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { getFaqItems } from '../../apis/content'

const languageStore = useLanguageStore()
const { t } = useI18n()
const faqItems = computed(() => getFaqItems(languageStore.currentLanguage))

usePageSeo({
  path: '/help',
  locale: languageStore.currentLanguage,
  title: t('help.title'),
  description: t('help.lead')
})
</script>

<template>
  <PageContainer>
    <p class="page-eyebrow">Help Center</p>
    <h1 class="page-title">{{ $t('help.title') }}</h1>
    <p class="page-lead">{{ $t('help.lead') }}</p>
    <a-collapse class="help-faq">
      <a-collapse-panel v-for="item in faqItems" :key="item.key" :header="item.question">
        {{ item.answer }}
      </a-collapse-panel>
    </a-collapse>
  </PageContainer>
</template>

<style scoped lang="scss">
.help-faq {
  max-width: 760px;
  margin-top: 40px;
}
</style>
