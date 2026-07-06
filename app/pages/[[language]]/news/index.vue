<!--
  【新闻列表页】

  路由：/news、/en/news
  Layout：default

  UI 区块：
  - 页头：eyebrow、标题、导语
  - 文章列表：卡片网格，每项含发布日期、标题、摘要、「阅读更多」链接

  用户流程：
  - 浏览文章列表 → 点击卡片跳转 /news/:slug 详情页

  数据 / API：
  - fetchNewsArticles(currentLanguage) → GET /api/content/news（nuxt-modern-starter-api）
  - formatPublishedDate() 格式化发布日期

  子组件：
  - PageContainer、ArrowRightOutlined 图标

  SEO / 边界：
  - usePageSeo 完整 SEO；SSR + SWR，动态内容经 API 按 locale 拉取，水合复用 payload
  - sitemap 收录；AppHeader 主导航有入口
-->
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ArrowRightOutlined } from '~/utils/antdIcon'
import { fetchNewsArticles } from '../../../apis/public/content'
import { formatPublishedDate } from '../../../utils/formatDate'

const languageStore = useLanguageStore()
const { localePath } = useLocalePath()
const { t } = useI18n()
const nuxtApp = useNuxtApp()

const { data: articles } = await useAsyncData(
  () => `news-articles:${languageStore.currentLanguage}`,
  () => fetchNewsArticles(languageStore.currentLanguage).then((response) => response.data.articles),
  {
    watch: [() => languageStore.currentLanguage],
    getCachedData(key) {
      return nuxtApp.payload.data[key] ?? nuxtApp.static.data[key]
    }
  }
)

usePageSeo({
  path: '/news',
  locale: languageStore.currentLanguage,
  title: t('news.title'),
  description: t('news.lead')
})
</script>

<template>
  <PageContainer>
    <p class="page-eyebrow">{{ $t('news.eyebrow') }}</p>
    <h1 class="page-title">{{ $t('news.title') }}</h1>
    <p class="page-lead">{{ $t('news.lead') }}</p>

    <div class="page-grid news-list">
      <a-card
        v-for="article in articles ?? []"
        :key="article.slug"
        class="page-surface-card news-card"
        :bordered="false"
      >
        <p class="page-meta">
          {{ formatPublishedDate(article.publishedAt, languageStore.currentLanguage) }}
        </p>
        <h2 class="news-card__title">{{ article.title }}</h2>
        <p class="news-card__description">{{ article.description }}</p>
        <NuxtLink :to="localePath(`/news/${article.slug}`)" class="page-text-link">
          {{ $t('common.readMore') }}
          <ArrowRightOutlined aria-hidden="true" />
        </NuxtLink>
      </a-card>
    </div>
  </PageContainer>
</template>

<style scoped lang="scss">
.news-list {
  grid-template-columns: 1fr;
}

.news-card__title {
  margin: 12px 0 0;
  font-size: clamp(22px, 3vw, 28px);
  letter-spacing: -0.03em;
}

.news-card__description {
  flex: 1;
  margin: 12px 0 0;
  color: var(--app-color-muted);
  line-height: 1.75;
}
</style>
