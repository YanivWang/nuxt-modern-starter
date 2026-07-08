<!--
  【关于我们】

  【文件职责】
    公开介绍页：使命、价值观与项目背景，纯静态 i18n 内容。

  【架构位置】
    公开 SEO 区 — app/pages/[[language]]，default layout，PUBLIC_PAGE_PATHS + prerender。

  路由：/about、/en/about
  Layout：default

  UI 区块：
  - 页头：标题、导语
  - Mission：目标说明
  - Values：三项原则清单
  - Story：项目背景段落

  【依赖关系】
  - 依赖：i18n about.*、usePageSeo、PageContainer
  - 被引用：AppHeader / AppFooter 导航

  【渲染 / 数据】
    prerender 静态 HTML；无后端 API。

  【边界与注意】
    usePageSeo 完整 canonical / hreflang。
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
