<!--
  【定价页】

  路由：/pricing、/en/pricing
  Layout：default

  UI 区块：
  - 页头：eyebrow、标题、导语
  - Plans：三档方案卡片（Starter / Growth / Custom），含价格、描述、功能清单、CTA 按钮
  - Growth 方案 featured 高亮（ribbon 徽章 + primary 按钮）
  - Includes：starter 通用能力说明（stack / routing / content / editor，双列清单）
  - 底部 note 备注

  用户流程：
  - Starter、Custom → CTA 跳转 /sign-up
  - Growth → CTA 跳转 /help

  数据 / API：
  - fetchPricingPage(currentLanguage) → GET /api/content/pricing（nuxt-modern-starter-api）

  子组件：
  - PageContainer、BaseButton、CheckOutlined 图标

  SEO / 边界：
  - usePageSeo 完整 SEO 元数据；SSR + SWR，动态内容经 API 按 locale 拉取，水合复用 payload
  - AppHeader 主导航、首页 secondary CTA、product-shell 底部导航均有入口
-->
<script setup lang="ts">
import { CheckOutlined } from '~/utils/antdIcon'
import { fetchPricingPage } from '../../apis/public/content'

const languageStore = useLanguageStore()
const { localePath } = useLocalePath()
const nuxtApp = useNuxtApp()

const { data: pricing } = await useAsyncData(
  () => `pricing-page:${languageStore.currentLanguage}`,
  () => fetchPricingPage(languageStore.currentLanguage).then((response) => response.data.pricing),
  {
    watch: [() => languageStore.currentLanguage],
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
    <p class="page-eyebrow">{{ pricing.eyebrow }}</p>
    <h1 class="page-title">{{ pricing.title }}</h1>
    <p class="page-lead">{{ pricing.lead }}</p>

    <div class="pricing-grid">
      <a-card
        v-for="plan in pricing.plans"
        :key="plan.key"
        class="pricing-card"
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
            <BaseButton :type="plan.featured ? 'primary' : 'default'">{{ plan.cta }}</BaseButton>
          </NuxtLink>
        </div>
      </a-card>
    </div>

    <section class="page-panel pricing-includes">
      <p class="page-eyebrow">{{ pricing.includes.eyebrow }}</p>
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

<style scoped lang="scss">
.pricing-grid {
  display: grid;
  align-items: stretch;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(16px, 2.5vw, 24px);
  margin-top: clamp(36px, 5vw, 52px);
}

.pricing-card {
  position: relative;
  overflow: hidden;
  height: 100%;
  border: 1px solid var(--app-color-border);
  border-radius: 24px;
  background: var(--app-color-bg);
  box-shadow: 0 12px 32px rgb(15 23 42 / 5%);
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    border-color 0.25s ease;

  &:hover:not(.pricing-card--featured) {
    border-color: rgb(22 119 255 / 22%);
    box-shadow: 0 18px 40px rgb(15 23 42 / 9%);
    transform: translateY(-2px);
  }

  :deep(.ant-card-body) {
    display: flex;
    height: 100%;
    flex-direction: column;
    padding: clamp(24px, 3vw, 32px);
  }
}

.pricing-card--featured {
  border: 2px solid rgb(22 119 255 / 32%);
  background:
    linear-gradient(180deg, rgb(22 119 255 / 7%) 0%, transparent 42%), var(--app-color-bg);
  box-shadow: 0 28px 60px rgb(22 119 255 / 14%);

  &::before {
    position: absolute;
    inset: 0 0 auto;
    height: 3px;
    background: linear-gradient(90deg, var(--app-color-primary), rgb(22 119 255 / 35%));
    content: '';
  }
}

.pricing-card__ribbon {
  position: absolute;
  top: 18px;
  right: 18px;
  padding: 6px 12px;
  border-radius: 999px;
  background: var(--app-color-primary);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  line-height: 1;
}

.pricing-card__price-block {
  margin-top: 4px;
}

.pricing-card__badge + .pricing-card__price-block {
  margin-top: 14px;
}

.pricing-card--featured .pricing-card__price-block {
  margin-top: 0;
  padding-right: 96px;
}

.pricing-card__price {
  margin: 0;
  color: var(--app-color-text);
  font-size: clamp(30px, 3.6vw, 38px);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.04em;
}

.pricing-card--featured .pricing-card__price {
  color: var(--app-color-primary);
}

.pricing-card__period {
  margin: 10px 0 0;
  color: var(--app-color-muted);
  font-size: 14px;
  line-height: 1.4;
}

.pricing-card__name {
  margin: 20px 0 0;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.pricing-card__description {
  margin: 14px 0 0;
  color: var(--app-color-muted);
  font-size: 15px;
  line-height: 1.65;
}

.pricing-card__features {
  flex: 1;
  margin-top: 24px;
}

.pricing-card__footer {
  margin-top: 28px;
  padding-top: 22px;
  border-top: 1px solid var(--app-color-border);
}

.pricing-card__cta {
  display: block;
  text-decoration: none;

  :deep(.ant-btn) {
    width: 100%;
    height: 44px;
    border-radius: 12px;
    font-weight: 600;
  }
}

.pricing-includes {
  margin-top: clamp(48px, 7vw, 72px);
}

.pricing-includes__title {
  margin: 12px 0 0;
  font-size: clamp(24px, 3vw, 32px);
  letter-spacing: -0.03em;
}

.pricing-includes__list {
  margin-top: 28px;
}

@media (width >= 901px) {
  .pricing-grid {
    align-items: center;
  }

  .pricing-card--featured {
    transform: scale(1.03);
  }

  .pricing-card--featured:hover {
    transform: scale(1.03) translateY(-2px);
  }
}

@media (width <= 900px) {
  .pricing-grid {
    grid-template-columns: 1fr;
  }

  .pricing-card--featured {
    order: -1;
  }

  .pricing-card__price-block {
    padding-right: 0;
  }
}
</style>
