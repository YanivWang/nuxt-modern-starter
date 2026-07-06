<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import {
  AppstoreOutlined,
  GlobalOutlined,
  ReadOutlined,
  RocketOutlined,
  SearchOutlined,
  UserOutlined
} from '~/utils/antdIcon'

const languageStore = useLanguageStore()
const { localePath } = useLocalePath()
const { t } = useI18n()

const stats = computed(() => [
  {
    value: t('home.stats.pages.value'),
    label: t('home.stats.pages.label')
  },
  {
    value: t('home.stats.modules.value'),
    label: t('home.stats.modules.label')
  },
  {
    value: t('home.stats.deploy.value'),
    label: t('home.stats.deploy.label')
  }
])

const featureCards = computed(() => [
  {
    title: t('home.features.design.title'),
    description: t('home.features.design.description'),
    icon: AppstoreOutlined
  },
  {
    title: t('home.features.i18n.title'),
    description: t('home.features.i18n.description'),
    icon: GlobalOutlined
  },
  {
    title: t('home.features.seo.title'),
    description: t('home.features.seo.description'),
    icon: SearchOutlined
  },
  {
    title: t('home.features.auth.title'),
    description: t('home.features.auth.description'),
    icon: UserOutlined
  },
  {
    title: t('home.features.content.title'),
    description: t('home.features.content.description'),
    icon: ReadOutlined
  },
  {
    title: t('home.features.deploy.title'),
    description: t('home.features.deploy.description'),
    icon: RocketOutlined
  }
])

const workflowSteps = computed(() => [
  t('home.workflow.steps.routes'),
  t('home.workflow.steps.content'),
  t('home.workflow.steps.auth')
])

usePageSeo({
  path: '/',
  locale: languageStore.currentLanguage,
  title: t('home.title'),
  description: t('home.lead')
})
</script>

<template>
  <div class="home-page">
    <section class="hero">
      <AppContainer class="hero__content">
        <div class="hero__copy">
          <p class="hero__eyebrow">{{ $t('home.eyebrow') }}</p>
          <h1 class="hero__title">{{ $t('home.title') }}</h1>
          <p class="hero__lead">{{ $t('home.lead') }}</p>
          <div class="hero__actions">
            <NuxtLink :to="localePath('/sign-up')" class="hero__primary-link">
              <BaseButton>{{ $t('home.primaryCta') }}</BaseButton>
            </NuxtLink>
            <NuxtLink class="hero__secondary-link" :to="localePath('/pricing')">
              {{ $t('home.secondaryCta') }}
            </NuxtLink>
          </div>
        </div>

        <div class="hero__preview" aria-hidden="true">
          <div class="preview-card">
            <div class="preview-card__header">
              <span />
              <span />
              <span />
            </div>
            <div class="preview-card__body">
              <div class="preview-card__metric">
                <small>{{ $t('home.preview.metricLabel') }}</small>
                <strong>{{ $t('home.preview.metricValue') }}</strong>
              </div>
              <div class="preview-card__chart">
                <span style="height: 42%" />
                <span style="height: 68%" />
                <span style="height: 52%" />
                <span style="height: 82%" />
                <span style="height: 60%" />
              </div>
              <div class="preview-card__list">
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
        </div>
      </AppContainer>
    </section>

    <PageContainer class="home-stats">
      <div v-for="stat in stats" :key="stat.label" class="page-stat-card">
        <strong>{{ stat.value }}</strong>
        <span>{{ stat.label }}</span>
      </div>
    </PageContainer>

    <PageContainer class="home-section">
      <div class="home-section__header">
        <p class="page-eyebrow">{{ $t('home.featuresEyebrow') }}</p>
        <h2>{{ $t('home.featuresTitle') }}</h2>
        <p>{{ $t('home.featuresLead') }}</p>
      </div>

      <div class="feature-grid page-grid page-grid--3">
        <a-card
          v-for="feature in featureCards"
          :key="feature.title"
          class="page-surface-card feature-card"
          :bordered="false"
        >
          <span class="feature-card__icon">
            <component :is="feature.icon" aria-hidden="true" />
          </span>
          <h3>{{ feature.title }}</h3>
          <p class="feature-card__description">{{ feature.description }}</p>
        </a-card>
      </div>
    </PageContainer>

    <PageContainer class="home-closing-section">
      <div class="page-panel workflow-panel">
        <div>
          <p class="page-eyebrow">{{ $t('home.workflow.eyebrow') }}</p>
          <h2>{{ $t('home.workflow.title') }}</h2>
          <p>{{ $t('home.workflow.lead') }}</p>
        </div>
        <ol class="page-step-list workflow-list">
          <li v-for="step in workflowSteps" :key="step">{{ step }}</li>
        </ol>
      </div>

      <div class="home-cta">
        <div>
          <p class="page-eyebrow">{{ $t('home.ctaEyebrow') }}</p>
          <h2>{{ $t('home.ctaTitle') }}</h2>
        </div>
        <NuxtLink :to="localePath('/sign-up')" class="home-cta__link">
          <BaseButton class="home-cta__button">{{ $t('home.primaryCta') }}</BaseButton>
        </NuxtLink>
      </div>
    </PageContainer>
  </div>
</template>

<style scoped lang="scss">
.home-page {
  --home-block-gap: clamp(64px, 9vw, 104px);

  overflow: hidden;
}

.hero {
  position: relative;
  padding-block: clamp(72px, 10vw, 132px) var(--home-block-gap);
  background:
    radial-gradient(circle at 18% 18%, rgb(22 119 255 / 14%), transparent 34%),
    linear-gradient(180deg, rgb(22 119 255 / 7%), transparent 72%);
}

.hero::after {
  position: absolute;
  inset: auto -20% -45% 52%;
  height: 420px;
  border-radius: 999px;
  background: rgb(22 119 255 / 10%);
  content: '';
  filter: blur(80px);
}

.hero__content {
  position: relative;
  z-index: 1;
  display: grid;
  align-items: center;
  grid-template-columns: minmax(0, 1.06fr) minmax(320px, 0.94fr);
  gap: clamp(40px, 7vw, 88px);
}

.hero__copy {
  max-width: 720px;
}

.hero__eyebrow {
  display: inline-flex;
  margin: 0 0 18px;
  padding: 8px 12px;
  border: 1px solid rgb(22 119 255 / 18%);
  border-radius: 999px;
  background: rgb(22 119 255 / 9%);
  color: var(--app-color-primary);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hero__title {
  margin: 0;
  font-size: clamp(42px, 6.2vw, 76px);
  line-height: 0.98;
  letter-spacing: -0.06em;
}

.hero__lead {
  max-width: 640px;
  margin: 24px 0 0;
  color: var(--app-color-muted);
  font-size: clamp(17px, 2vw, 21px);
  line-height: 1.75;
}

.hero__actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 18px;
  margin-top: 34px;
}

.hero__primary-link,
.hero__secondary-link,
.home-cta__link {
  text-decoration: none;
}

.hero__secondary-link {
  color: var(--app-color-text);
  font-weight: 700;
}

.hero__preview {
  display: flex;
  justify-content: flex-end;
}

.preview-card {
  width: min(100%, 430px);
  padding: 12px;
  border: 1px solid rgb(22 119 255 / 16%);
  border-radius: 28px;
  background: rgb(255 255 255 / 70%);
  box-shadow: var(--app-shadow-sm);
  backdrop-filter: blur(20px);
}

.preview-card__header {
  display: flex;
  gap: 8px;
  padding: 12px;
}

.preview-card__header span {
  display: block;
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: var(--app-color-primary);
}

.preview-card__body {
  padding: 22px;
  border-radius: 22px;
  background: var(--app-color-bg);
}

.preview-card__metric {
  display: grid;
  gap: 8px;
}

.preview-card__metric small {
  color: var(--app-color-muted);
  font-weight: 700;
  text-transform: uppercase;
}

.preview-card__metric strong {
  font-size: 42px;
  letter-spacing: -0.05em;
}

.preview-card__chart {
  display: flex;
  height: 160px;
  align-items: end;
  gap: 14px;
  margin-top: 28px;
  padding: 18px;
  border-radius: 18px;
  background: var(--app-color-elevated);
}

.preview-card__chart span {
  flex: 1;
  border-radius: 999px 999px 8px 8px;
  background: linear-gradient(180deg, var(--app-color-primary), rgb(22 119 255 / 22%));
}

.preview-card__list {
  display: grid;
  gap: 10px;
  margin-top: 20px;
}

.preview-card__list span {
  height: 12px;
  border-radius: 999px;
  background: var(--app-color-elevated);
}

.preview-card__list span:nth-child(2) {
  width: 78%;
}

.preview-card__list span:nth-child(3) {
  width: 56%;
}

.home-stats,
.home-section,
.home-closing-section {
  padding-block: 0;
}

.home-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(16px, 2.5vw, 24px);
}

.home-section {
  padding-top: var(--home-block-gap);
}

.home-closing-section {
  padding-top: var(--home-block-gap);
  padding-bottom: var(--home-block-gap);
}

.home-section__header {
  max-width: 720px;
  margin-inline: auto;
  text-align: center;
}

.home-section__header h2,
.workflow-panel h2,
.home-cta h2 {
  margin: 0;
  font-size: clamp(32px, 4vw, 48px);
  line-height: 1.08;
  letter-spacing: -0.04em;
}

.home-section__header p:not(.page-eyebrow),
.workflow-panel p:not(.page-eyebrow) {
  margin: 18px 0 0;
  color: var(--app-color-muted);
  font-size: 18px;
  line-height: 1.7;
}

.feature-grid {
  margin-top: 42px;
}

.feature-card__icon {
  display: inline-flex;
  width: 34px;
  height: 34px;
  align-items: center;
  justify-content: center;
  margin-bottom: 22px;
  border-radius: 10px;
  background:
    linear-gradient(135deg, rgb(255 255 255 / 55%), transparent), var(--app-color-primary);
  color: #fff;
  font-size: 16px;
}

.feature-card h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
}

.feature-card__description {
  margin: 12px 0 0;
  color: var(--app-color-muted);
  line-height: 1.7;
}

.workflow-panel {
  display: grid;
  align-items: center;
  grid-template-columns: minmax(0, 0.95fr) minmax(280px, 0.75fr);
  gap: clamp(32px, 6vw, 72px);
  margin-top: 0;
}

.workflow-list {
  margin-top: 0;
}

.home-cta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-top: var(--home-block-gap);
  padding: clamp(30px, 5vw, 54px);
  border: var(--app-home-cta-border);
  border-radius: 24px;
  background: var(--app-home-cta-bg);
  color: var(--app-home-cta-text);
  box-shadow: var(--app-home-cta-shadow);
}

.home-cta .page-eyebrow {
  color: var(--app-home-cta-eyebrow);
}

.home-cta h2 {
  max-width: 680px;
}

.home-cta__button,
.home-cta__link :deep(.home-cta__button.ant-btn) {
  min-width: 160px;
  height: 44px;
  border-radius: 12px;
  border-color: var(--app-home-cta-btn-border) !important;
  background: var(--app-home-cta-btn-bg) !important;
  color: var(--app-home-cta-btn-text) !important;
  font-weight: 600;
  box-shadow: none !important;

  &:hover,
  &:focus-visible {
    border-color: var(--app-home-cta-btn-border) !important;
    background: var(--app-home-cta-btn-bg) !important;
    color: var(--app-home-cta-btn-text) !important;
    opacity: 0.92;
  }
}

@media (width <= 900px) {
  .hero__content,
  .feature-grid,
  .workflow-panel {
    grid-template-columns: 1fr;
  }

  .hero__preview {
    justify-content: center;
  }

  .hero__copy,
  .home-section__header {
    max-width: none;
  }

  .home-stats {
    grid-template-columns: 1fr;
  }

  .home-cta {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (width <= 560px) {
  .hero {
    padding-top: 56px;
  }

  .hero__title {
    font-size: 40px;
  }

  .preview-card__metric strong {
    font-size: 34px;
  }
}
</style>
