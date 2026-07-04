<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const languageStore = useLanguageStore()
const { localePath } = useLocalePath()
const { t } = useI18n()

usePageSeo({
  path: '/',
  locale: languageStore.currentLanguage,
  title: t('home.title'),
  description: t('home.lead')
})
</script>

<template>
  <div>
    <section class="hero">
      <div class="hero__content">
        <p class="page-eyebrow">{{ $t('home.eyebrow') }}</p>
        <h1 class="page-title">{{ $t('home.title') }}</h1>
        <p class="page-lead">{{ $t('home.lead') }}</p>
        <div class="hero__actions">
          <BaseButton>{{ $t('home.primaryCta') }}</BaseButton>
          <NuxtLink :to="localePath('/pricing')">{{ $t('home.secondaryCta') }}</NuxtLink>
        </div>
      </div>
    </section>

    <PageContainer class="home-grid">
      <a-card :title="$t('home.matrixTitle')">
        <p>Nuxt 4, TypeScript, Pinia, vue-i18n, SEO, useApi, Docker, and Nginx.</p>
      </a-card>
      <a-card :title="$t('home.solutionTitle')">
        <p>Marketing pages, SEO pages, content hubs, pricing pages, and SaaS frontends.</p>
      </a-card>
      <a-card :title="$t('home.customerTitle')">
        <p>Use this section as the starting structure for proof points and customer stories.</p>
      </a-card>
    </PageContainer>
  </div>
</template>

<style scoped lang="scss">
.hero {
  padding: clamp(72px, 12vw, 140px) clamp(20px, 6vw, 80px);
}

.hero__content {
  max-width: 820px;
}

.hero__actions {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: 36px;
}

.home-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}

@media (width <= 900px) {
  .home-grid {
    grid-template-columns: 1fr;
  }
}
</style>
