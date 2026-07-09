<!--
  【新闻列表页】

  【文件职责】
    公开新闻索引：按 locale 拉取文章摘要列表，链到详情页。

  【架构位置】
    公开 SEO 区 — app/pages/[[language]]/news，default layout，PUBLIC_PAGE_PATHS + SWR。

  路由：/news、/en/news
  Layout：default

  UI 区块：
  - 页头：标题、导语
  - 文章列表：卡片网格，每项含发布日期、标题、摘要、「阅读更多」链接

  用户流程：
  - 浏览文章列表 → 点击卡片跳转 /news/:slug 详情页

  【依赖关系】
  - 依赖：~/api/public fetchNewsArticles、formatPublishedDate、usePageSeo
  - 被引用：AppHeader、sitemap（server/utils/seo 动态 slug）

  【渲染 / 数据】
    SSR + SWR 1h；fetchNewsArticles → adapter /content/news（网关 GET /api/content/news）。
    useAsyncData 水合复用 payload。

  子组件：
  - PageContainer、ArrowRightOutlined 图标

  【边界与注意】
    usePageSeo 完整 hreflang；列表页 slug 详情由 [slug].vue 承接。
-->
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ArrowRightOutlined } from '~/utils/antdIcon'
import { fetchNewsArticles } from '~/api/public'
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
    // 列表页走 SWR 1h；客户端导航复用 SSR payload
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
