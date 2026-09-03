<!--
  【新闻列表页】

  【文件职责】
    公开新闻索引第 1 页：按 locale 拉取文章摘要，链到详情页与后续归档页。

  【架构位置】
    公开 SEO 区 — app/pages/[[language]]/news，default layout，PUBLIC_PAGE_PATHS + SWR。

  路由：/news、/en/news
  Layout：default

  UI 区块：
  - 页头：标题、导语
  - 文章列表：卡片网格，每项含发布日期、标题、摘要、「阅读更多」链接
  - 翻页导航：第 2 页起链到 /news/page/N

  用户流程：
  - 浏览文章列表 → 点击卡片跳转 /news/:slug 详情页
  - 文章超过一页 → 「下一页」跳 /news/page/2

  【依赖关系】
  - 依赖：~/api/public fetchNewsArticles、NewsArticleList、usePageSeo
  - 被引用：AppHeader、sitemap（server/utils/seo 动态 slug 与归档页）

  【渲染 / 数据】
    SSR + SWR 1h；fetchNewsArticles → adapter /content/news（网关 GET /api/v1/content/news）。
    显式传 limit=NEWS_PAGE_SIZE、offset=0；useAsyncData 水合复用 payload。

  子组件：
  - PageContainer、NewsArticleList

  【边界与注意】
    这一页就是归档第 1 页，canonical 为 /news。/news/page/1 由 canonicalRequestPath 301 折回，
    否则同一份内容有两个可收录 URL。
-->
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { fetchNewsArticles } from '~/api/public'
import { NEWS_PAGE_SIZE } from '../../../../config/routes'

const languageStore = useLanguageStore()
const { t } = useI18n()
const nuxtApp = useNuxtApp()

const { data: newsList } = await useAsyncData(
  () => `news-articles:${languageStore.currentLanguage}:1`,
  () =>
    fetchNewsArticles(languageStore.currentLanguage, {
      limit: NEWS_PAGE_SIZE,
      offset: 0
    }).then((response) => response.data),
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

    <NewsArticleList
      :articles="newsList?.articles ?? []"
      :locale="languageStore.currentLanguage"
      :current-page="1"
      :total="newsList?.pagination.total ?? 0"
    />
  </PageContainer>
</template>
