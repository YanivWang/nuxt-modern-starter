<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { CheckOutlined } from '~/utils/antdIcon'
import { getFaqItems } from '../../apis/public/content'

const languageStore = useLanguageStore()
const { t } = useI18n()
const faqItems = computed(() => getFaqItems(languageStore.currentLanguage))

const quickStartStepKeys = ['install', 'dev', 'explore', 'extend'] as const

const quickStartSteps = computed(() =>
  quickStartStepKeys.map((key) => t(`help.quickStart.steps.${key}`))
)

const resourceKeys = ['architecture', 'usage', 'deployment'] as const

const resources = computed(() => resourceKeys.map((key) => t(`help.resources.${key}`)))

usePageSeo({
  path: '/help',
  locale: languageStore.currentLanguage,
  title: t('help.title'),
  description: t('help.lead')
})
</script>

<template>
  <PageContainer>
    <p class="page-eyebrow">{{ $t('help.eyebrow') }}</p>
    <h1 class="page-title">{{ $t('help.title') }}</h1>
    <p class="page-lead">{{ $t('help.lead') }}</p>

    <section class="page-panel">
      <h2 class="page-panel__title">{{ $t('help.quickStart.title') }}</h2>
      <ol class="page-step-list help-steps">
        <li v-for="step in quickStartSteps" :key="step">{{ step }}</li>
      </ol>
    </section>

    <section class="page-panel">
      <h2 class="page-panel__title">{{ $t('help.resources.title') }}</h2>
      <ul class="page-check-list help-resources">
        <li v-for="resource in resources" :key="resource">
          <CheckOutlined class="page-check-list__icon" aria-hidden="true" />
          <span>{{ resource }}</span>
        </li>
      </ul>
    </section>

    <section class="page-panel">
      <h2 class="page-panel__title">{{ $t('help.faqTitle') }}</h2>
      <a-collapse class="page-faq" :bordered="false">
        <a-collapse-panel v-for="item in faqItems" :key="item.key" :header="item.question">
          {{ item.answer }}
        </a-collapse-panel>
      </a-collapse>
    </section>
  </PageContainer>
</template>

<style scoped lang="scss">
.help-steps,
.help-resources {
  margin-top: 24px;
}
</style>
