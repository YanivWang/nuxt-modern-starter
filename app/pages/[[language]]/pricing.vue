<!--
  【定价页】

  【文件职责】
    公开展示三档定价方案与能力清单，CTA 导向注册或帮助页。

  【架构位置】
    公开 SEO 区 — app/pages/[[language]]，default layout，PUBLIC_PAGE_PATHS，默认 SSR。

  路由：/pricing、/en/pricing
  Layout：default

  UI 区块：
  - 页头：标题、导语
  - Plans：三档方案卡片（Starter / Growth / Custom），含价格、描述、功能清单、CTA 按钮
  - Growth 方案 featured 高亮（ribbon 徽章 + primary 按钮）
  - Includes：starter 通用能力说明（stack / routing / content / editor，双列清单）
  - 底部 note 备注

  用户流程：
  - Starter、Custom → CTA 跳转 /sign-up
  - Growth → CTA 跳转 /help

  【依赖关系】
  - 依赖：~/api/public fetchPricingPage、usePageSeo、PageContainer / BaseButton
  - 被引用：AppHeader、首页 CTA、product-shell 底部定价链接

  【渲染 / 数据】
    SSR；fetchPricingPage → adapter /content/pricing（网关 GET /api/content/pricing，base 已含 /api）。
    useAsyncData 水合复用 payload。

  子组件：
  - PageContainer、BaseButton、CheckOutlined 图标

  【边界与注意】
    usePageSeo 完整 hreflang；动态 title/description 来自 API 响应。
-->
<script setup lang="ts">
import { CheckOutlined } from '~/utils/antdIcon'
import { fetchPricingPage } from '~/api/public'

const languageStore = useLanguageStore()
const { localePath } = useLocalePath()
const nuxtApp = useNuxtApp()

const { data: pricing } = await useAsyncData(
  () => `pricing-page:${languageStore.currentLanguage}`,
  () => fetchPricingPage(languageStore.currentLanguage).then((response) => response.data.pricing),
  {
    watch: [() => languageStore.currentLanguage],
    // SSR payload 水合复用，避免客户端重复请求 /content/pricing
    getCachedData(key) {
      return nuxtApp.payload.data[key] ?? nuxtApp.static.data[key]
    }
  }
)

usePageSeo({
  path: '/pricing',
  locale: languageStore.currentLanguage,
  title: pricing.value?.title,
  description: pricing.value?.lead
})
</script>

<template>
  <PageContainer v-if="pricing">
    <h1 class="page-title">{{ pricing.title }}</h1>
    <p class="page-lead">{{ pricing.lead }}</p>

    <div class="pricing-grid">
      <a-card
        v-for="plan in pricing.plans"
        :key="plan.key"
        class="page-surface-card pricing-card"
        :class="{ 'pricing-card--featured': plan.featured }"
        :bordered="false"
      >
        <span v-if="plan.featured" class="pricing-card__ribbon">{{ plan.badge }}</span>

        <p v-if="!plan.featured" class="page-badge pricing-card__badge">{{ plan.badge }}</p>

        <div class="pricing-card__price-block">
          <p class="pricing-card__price">{{ plan.price }}</p>
          <p class="pricing-card__period">{{ plan.period }}</p>
        </div>

        <h2 class="pricing-card__name">{{ plan.name }}</h2>
        <p class="pricing-card__description">{{ plan.description }}</p>

        <ul class="page-check-list pricing-card__features">
          <li v-for="feature in plan.features" :key="feature">
            <CheckOutlined class="page-check-list__icon" aria-hidden="true" />
            <span>{{ feature }}</span>
          </li>
        </ul>

        <div class="pricing-card__footer">
          <NuxtLink :to="localePath(plan.ctaPath)" class="pricing-card__cta">
            <BaseButton
              :type="plan.featured ? 'primary' : 'default'"
              class="page-cta-btn page-cta-btn--block"
            >
              {{ plan.cta }}
            </BaseButton>
          </NuxtLink>
        </div>
      </a-card>
    </div>

    <section class="page-panel pricing-includes">
      <h2 class="pricing-includes__title">{{ pricing.includes.title }}</h2>
      <ul class="page-check-list page-check-list--2col pricing-includes__list">
        <li v-for="item in pricing.includes.items" :key="item">
          <CheckOutlined class="page-check-list__icon" aria-hidden="true" />
          <span>{{ item }}</span>
        </li>
      </ul>
    </section>

    <p class="page-note">{{ pricing.note }}</p>
  </PageContainer>
</template>
