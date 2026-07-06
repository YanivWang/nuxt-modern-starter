<!--
  【关于我们】

  路由：/about、/en/about
  Layout：default

  UI 区块：
  - 页头：eyebrow、标题、导语
  - Mission：目标说明
  - Values：三项原则清单
  - Story：项目背景段落

  数据 / API：
  - 纯静态 i18n（about.*），无后端请求

  SEO / 边界：
  - usePageSeo 完整 SEO；prerenderRoutes 构建时静态化
-->
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { CheckOutlined } from '~/utils/antdIcon'

const languageStore = useLanguageStore()
const { t } = useI18n()

const valueKeys = ['focus', 'quality', 'openness'] as const
const storyKeys = ['origin', 'practice', 'next'] as const

const values = computed(() => valueKeys.map((key) => t(`about.values.items.${key}`)))
const storyParagraphs = computed(() => storyKeys.map((key) => t(`about.story.paragraphs.${key}`)))

usePageSeo({
  path: '/about',
  locale: languageStore.currentLanguage,
  title: t('about.title'),
  description: t('about.lead')
})
</script>

<template>
  <PageContainer>
    <p class="page-eyebrow">{{ $t('about.eyebrow') }}</p>
    <h1 class="page-title">{{ $t('about.title') }}</h1>
    <p class="page-lead">{{ $t('about.lead') }}</p>

    <section class="page-panel">
      <h2 class="page-panel__title">{{ $t('about.mission.title') }}</h2>
      <p class="about-section__body">{{ $t('about.mission.body') }}</p>
    </section>

    <section class="page-panel">
      <h2 class="page-panel__title">{{ $t('about.values.title') }}</h2>
      <ul class="page-check-list about-values">
        <li v-for="value in values" :key="value">
          <CheckOutlined class="page-check-list__icon" aria-hidden="true" />
          <span>{{ value }}</span>
        </li>
      </ul>
    </section>

    <section class="page-panel">
      <h2 class="page-panel__title">{{ $t('about.story.title') }}</h2>
      <div class="about-story">
        <p v-for="paragraph in storyParagraphs" :key="paragraph">{{ paragraph }}</p>
      </div>
    </section>
  </PageContainer>
</template>

<style scoped lang="scss">
.about-section__body,
.about-values,
.about-story {
  margin-top: 24px;
}

.about-section__body,
.about-story p {
  color: var(--app-color-muted);
  font-size: 16px;
  line-height: 1.75;
}
</style>
