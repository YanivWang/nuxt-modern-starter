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
              <BaseButton class="page-cta-btn page-cta-btn--brand page-cta-btn--large">
                {{ $t('home.primaryCta') }}
              </BaseButton>
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
          <BaseButton class="page-cta-btn page-cta-btn--inverted">
            {{ $t('home.primaryCta') }}
          </BaseButton>
        </NuxtLink>
      </div>
    </PageContainer>
  </div>
</template>
