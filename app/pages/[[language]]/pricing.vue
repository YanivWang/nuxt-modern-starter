<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const languageStore = useLanguageStore()
const { t } = useI18n()

usePageSeo({
  path: '/pricing',
  locale: languageStore.currentLanguage,
  title: t('pricing.title'),
  description: t('pricing.lead')
})

const plans = [
  { name: 'Starter', price: '$0', features: ['Nuxt 4', 'SEO', 'i18n'] },
  { name: 'Growth', price: '$49', features: ['useApi', 'Docker', 'Nginx'] },
  { name: 'Custom', price: 'Talk to us', features: ['Theme tokens', 'Content pages', 'Docs'] }
]
</script>

<template>
  <PageContainer>
    <p class="page-eyebrow">Pricing</p>
    <h1 class="page-title">{{ $t('pricing.title') }}</h1>
    <p class="page-lead">{{ $t('pricing.lead') }}</p>
    <div class="pricing-grid">
      <a-card v-for="plan in plans" :key="plan.name" :title="plan.name">
        <p class="pricing-grid__price">{{ plan.price }}</p>
        <ul>
          <li v-for="feature in plan.features" :key="feature">{{ feature }}</li>
        </ul>
      </a-card>
    </div>
  </PageContainer>
</template>

<style scoped lang="scss">
.pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
  margin-top: 40px;
}

.pricing-grid__price {
  color: var(--app-color-primary);
  font-size: 28px;
  font-weight: 800;
}

@media (width <= 900px) {
  .pricing-grid {
    grid-template-columns: 1fr;
  }
}
</style>
