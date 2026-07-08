<!--
  【营销首页】

  【文件职责】
    公开营销落地页：Hero / Stats / Features / Workflow / CTA，引导注册与定价。

  【架构位置】
    公开 SEO 区 — app/pages/[[language]]，default layout，在 PUBLIC_PAGE_PATHS 内。

  路由：/、/en（可选语言前缀 [[language]]）
  Layout：default

  UI 区块：
  - Hero：标题、副文案、主 CTA（注册）与次 CTA（定价）、右侧产品预览大图
  - Stats：3 项数据统计（页面数 / 模块数 / 混合渲染策略）
  - Features：6 张功能卡片（设计系统、i18n、SEO、鉴权、内容、部署）
  - Workflow：3 步上手流程说明
  - Closing CTA：底部再次引导注册

  用户流程：
  - 访客浏览产品介绍 → 点击注册跳转 /sign-up，或点击定价跳转 /pricing

  【依赖关系】
  - 依赖：i18n home.*、usePageSeo、useLocalePath、PageContainer / BaseButton / BasePicture（auto-import）
  - 被引用：AppHeader NAV_ITEMS 首页入口、sitemap / hreflang

  【渲染 / 数据】
    prerender 静态 HTML；纯 i18n 文案，无后端 API。

  子组件：
  - AppContainer、PageContainer、BaseButton、BasePicture（页面内直接组合，无 feature 子组件）

  【边界与注意】
    usePageSeo 含 webPage + Organization JSON-LD；不在 sign-in / sign-up 集合内。
    /zh 前缀由 app/middleware/locale.global.ts 301 到 /。
-->
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

const runtimeConfig = useRuntimeConfig()

usePageSeo({
  path: '/',
  locale: languageStore.currentLanguage,
  title: t('home.title'),
  description: t('home.lead'),
  webPage: true,
  includeOrganization: true,
  siteVerification: {
    google: runtimeConfig.public.googleSiteVerification || undefined,
    baidu: runtimeConfig.public.baiduSiteVerification || undefined
  }
})
</script>

<template>
  <div class="home-page">
    <section class="hero">
      <AppContainer class="hero__content">
        <div class="hero__copy">
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
          <BasePicture
            class="hero__product-picture"
            src="/product-hero.svg"
            :alt="$t('home.title')"
            width="1120"
            height="720"
            loading="eager"
            fetchpriority="high"
            sizes="(min-width: 1200px) 560px, (min-width: 900px) 48vw, 100vw"
          />
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
          <h2>{{ $t('home.workflow.title') }}</h2>
          <p>{{ $t('home.workflow.lead') }}</p>
        </div>
        <ol class="page-step-list workflow-list">
          <li v-for="step in workflowSteps" :key="step">{{ step }}</li>
        </ol>
      </div>

      <div class="home-cta">
        <div>
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
  --home-block-gap: clamp(72px, 9vw, 116px);

  background: var(--app-gradient-home-page);
  overflow: hidden;
}

.hero {
  position: relative;
  isolation: isolate;
  padding-block: clamp(78px, 8vw, 118px) clamp(86px, 9vw, 126px);
  background: var(--app-gradient-hero-glow);
  color: var(--app-color-text);
}

.hero::before,
.hero::after {
  position: absolute;
  content: '';
  pointer-events: none;
}

.hero::before {
  inset: 0;
  z-index: -2;
  background-image:
    linear-gradient(var(--app-color-brand-a5) 1px, transparent 1px),
    linear-gradient(90deg, var(--app-color-brand-a5) 1px, transparent 1px);
  background-position: center top;
  background-size: 80px 80px;
  mask-image: linear-gradient(180deg, #000 0%, transparent 70%);
}

.hero::after {
  inset: auto -10% -1px;
  z-index: -1;
  height: clamp(88px, 12vw, 156px);
  border-radius: 50% 50% 0 0 / 100% 100% 0 0;
  background: var(--app-color-bg);
}

.hero__content {
  position: relative;
  z-index: 1;
  display: grid;
  align-items: center;
  grid-template-columns: minmax(0, 0.84fr) minmax(520px, 1fr);
  gap: clamp(34px, 4.8vw, 58px);
}

.hero__copy {
  max-width: 620px;
}

.hero__title {
  margin: 0;
  color: var(--app-color-text-strong);
  font-size: clamp(40px, 4.7vw, 64px);
  line-height: 1.02;
  letter-spacing: -0.052em;
  text-wrap: balance;
  word-break: keep-all;
}

.hero__lead {
  max-width: 560px;
  margin: 24px 0 0;
  color: var(--app-color-subtle);
  font-size: clamp(16px, 1.55vw, 18px);
  line-height: 1.72;
}

.hero__actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 34px;
}

.hero__primary-link,
.hero__secondary-link,
.home-cta__link {
  text-decoration: none;
}

.hero__secondary-link {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  padding-inline: 18px;
  border: 1px solid var(--app-color-brand-a12);
  border-radius: 12px;
  background: var(--app-color-overlay);
  color: var(--app-color-text-strong);
  font-weight: 700;
  box-shadow: 0 10px 24px var(--app-color-brand-a6);
  backdrop-filter: blur(12px);
}

.hero__primary-link :deep(.ant-btn) {
  min-width: 168px;
  height: 48px;
  border: 0;
  border-radius: 14px;
  background: var(--app-color-brand);
  color: var(--app-color-brand-contrast);
  font-weight: 800;
  box-shadow: var(--app-shadow-brand);
}

.hero__preview {
  position: relative;
  display: flex;
  width: min(100%, 760px);
  justify-content: center;
  justify-self: end;
  padding: clamp(8px, 1.2vw, 14px);
  border: 1px solid var(--app-color-brand-a9);
  border-radius: clamp(24px, 3vw, 34px);
  background:
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--app-color-surface) 86%, transparent),
      var(--app-color-overlay)
    ),
    var(--app-color-overlay);
  box-shadow:
    0 34px 90px var(--app-color-brand-a16),
    inset 0 1px 0 color-mix(in srgb, var(--app-color-surface) 70%, transparent);
  backdrop-filter: blur(20px);
}

.hero__preview::before,
.hero__preview::after {
  position: absolute;
  z-index: -1;
  display: block;
  border-radius: 999px;
  content: '';
  filter: blur(20px);
}

.hero__preview::before {
  top: 12%;
  left: -8%;
  width: 120px;
  height: 120px;
  background: var(--app-color-primary-a13);
}

.hero__preview::after {
  right: -4%;
  bottom: 10%;
  width: 150px;
  height: 150px;
  background: var(--app-color-primary-a10);
}

.hero__product-picture {
  display: block;
  width: 100%;
}

.hero__product-picture :deep(img) {
  display: block;
  width: 100%;
  height: auto;
  border-radius: clamp(18px, 2.4vw, 26px);
  box-shadow: 0 22px 52px var(--app-color-brand-a14);
}

.home-stats,
.home-section,
.home-closing-section {
  padding-block: 0;
}

.home-stats {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(16px, 2.5vw, 24px);
  margin-top: clamp(-34px, -3vw, -18px);
}

.home-stats :deep(.page-stat-card),
.page-stat-card {
  border: 1px solid var(--app-color-brand-a7);
  border-radius: 20px;
  background: var(--app-gradient-surface-card), var(--app-color-bg);
  box-shadow: 0 16px 44px var(--app-color-brand-a8);
  backdrop-filter: blur(14px);
}

:global(:root[data-theme='dark']) .page-stat-card {
  background: var(--app-gradient-surface-card), var(--app-color-bg);
}

.home-section {
  padding-top: var(--home-block-gap);
}

.home-closing-section {
  padding-top: var(--home-block-gap);
  padding-bottom: var(--home-block-gap);
}

.home-section__header {
  max-width: 780px;
  margin-inline: auto;
  text-align: center;
}

.home-section__header h2,
.workflow-panel h2,
.home-cta h2 {
  margin: 0;
  font-size: clamp(34px, 4.2vw, 54px);
  line-height: 1.08;
  letter-spacing: -0.038em;
  text-wrap: balance;
}

.home-section__header p,
.workflow-panel p {
  margin: 18px 0 0;
  color: var(--app-color-muted);
  font-size: 18px;
  line-height: 1.7;
}

.feature-grid {
  margin-top: clamp(42px, 5vw, 58px);
}

.feature-card__icon {
  display: inline-flex;
  width: 42px;
  height: 42px;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  border-radius: 14px;
  background:
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--app-color-surface) 52%, transparent),
      transparent
    ),
    var(--app-gradient-brand-accent);
  color: var(--app-color-brand-contrast);
  font-size: 18px;
  box-shadow: 0 12px 28px var(--app-color-brand-a16);
}

.feature-card {
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  position: absolute;
  inset: 0 0 auto;
  height: 3px;
  background: var(--app-gradient-accent-line);
  content: '';
  opacity: 0;
  transition: opacity 0.25s ease;
}

.feature-card:hover::before {
  opacity: 1;
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
  border-radius: 28px;
  background:
    radial-gradient(circle at 14% 14%, var(--app-color-primary-a8), transparent 34%),
    linear-gradient(135deg, var(--app-color-elevated), var(--app-color-bg));
  box-shadow: var(--app-shadow-surface);
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
  border-radius: 28px;
  background: var(--app-home-cta-bg);
  color: var(--app-home-cta-text);
  box-shadow: var(--app-home-cta-shadow);
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
    justify-self: center;
  }

  .hero__copy,
  .home-section__header {
    max-width: none;
    text-align: center;
  }

  .hero__lead {
    margin-inline: auto;
  }

  .hero__actions {
    justify-content: center;
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
    padding-top: 58px;
  }

  .hero__title {
    font-size: 32px;
    letter-spacing: -0.04em;
    word-break: normal;
  }

  .hero__lead {
    font-size: 16px;
    line-height: 1.65;
  }

  .hero__product-picture {
    transform: none;
  }
}
</style>
