<!--
  【新闻详情页】

  【文件职责】
    单篇新闻正文页：按 slug + locale 拉取文章，输出 Article JSON-LD。

  【架构位置】
    公开 SEO 区 — app/pages/[[language]]/news，default layout，SWR。

  路由：/news/:slug、/en/news/:slug（如 /news/starter-release）
  Layout：default

  UI 区块：
  - 发布日期（大写 meta 样式）
  - 文章标题、摘要
  - 正文：article.body 段落数组逐段渲染
  - 底部「返回新闻列表」链接

  用户流程：
  - 从列表页进入 → 阅读全文 → 返回 /news

  【依赖关系】
  - 依赖：~/api/public fetchLocalizedNewsArticle、formatPublishedDate、usePageSeo
  - 被引用：新闻列表页链接、sitemap 按 slug 收录

  【渲染 / 数据】
    SSR + SWR；fetchLocalizedNewsArticle → adapter /content/news/:slug（网关 GET /api/v1/content/news/:slug）。
    useAsyncData 水合复用 payload。

  【边界与注意】
    slug 不存在 → createError 404（news.notFound）。
    usePageSeo article 参数生成 Article JSON-LD，og:type=article。
-->
<script setup lang="ts">
import { ArrowRightOutlined } from '~/utils/antdIcon'
import { fetchLocalizedNewsArticle } from '~/api/public'
import { formatPublishedDate } from '../../../utils/formatDate'

const route = useRoute()
const languageStore = useLanguageStore()
const { localePath } = useLocalePath()
const nuxtApp = useNuxtApp()
const slug = route.params.slug as string

const { data: article, error } = await useAsyncData(
  () => `news-article:${slug}:${languageStore.currentLanguage}`,
  () =>
    fetchLocalizedNewsArticle(slug, languageStore.currentLanguage).then(
      (response) => response.data.article
    ),
  {
    watch: [() => languageStore.currentLanguage, () => slug],
    getCachedData(key) {
      return nuxtApp.payload.data[key] ?? nuxtApp.static.data[key]
    }
  }
)

if (error.value || !article.value) {
  // slug 不存在或 API 失败 → 404（非 500），与 SEO 死链处理一致
  throw createError({
    statusCode: 404,
    statusMessage: 'news.notFound'
  })
}

usePageSeo({
  path: `/news/${slug}`,
  locale: languageStore.currentLanguage,
  title: article.value.title,
  description: article.value.description,
  // article 参数触发 Article JSON-LD 与 og:type=article
  article: {
    title: article.value.title,
    description: article.value.description,
    publishedAt: article.value.publishedAt
  }
})
</script>

<template>
  <PageContainer v-if="article">
    <p class="page-meta page-meta--article">
      {{ formatPublishedDate(article.publishedAt, languageStore.currentLanguage) }}
    </p>
    <h1 class="page-title">{{ article.title }}</h1>
    <p class="page-lead">{{ article.description }}</p>

    <article class="page-content-block news-article">
      <p v-for="(paragraph, index) in article.body" :key="index">{{ paragraph }}</p>
    </article>

    <NuxtLink :to="localePath('/news')" class="page-back-link">
      <ArrowRightOutlined class="page-icon--flip" aria-hidden="true" />
      {{ $t('nav.news') }}
    </NuxtLink>
  </PageContainer>
</template>
