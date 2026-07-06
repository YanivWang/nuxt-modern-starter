<!--
  【新闻详情页】

  路由：/news/:slug、/en/news/:slug（如 /news/starter-release）
  Layout：default

  UI 区块：
  - 发布日期（大写 meta 样式）
  - 文章标题、摘要
  - 正文：article.body 段落数组逐段渲染
  - 底部「返回新闻列表」链接

  用户流程：
  - 从列表页进入 → 阅读全文 → 返回 /news

  数据 / API：
  - getLocalizedNewsArticle(slug, language) → config/content/news.ts
  - formatPublishedDate() 格式化日期

  SEO / 边界：
  - slug 不存在 → createError 404（news.notFound）
  - usePageSeo 传入 article 参数，生成 Article JSON-LD 结构化数据
  - sitemap 按 slug 逐篇收录
-->
<script setup lang="ts">
import { ArrowRightOutlined } from '~/utils/antdIcon'
import { getLocalizedNewsArticle } from '../../../apis/public/content'
import { formatPublishedDate } from '../../../utils/formatDate'

const route = useRoute()
const languageStore = useLanguageStore()
const { localePath } = useLocalePath()
const slug = route.params.slug as string
const article = computed(() => getLocalizedNewsArticle(slug, languageStore.currentLanguage))

if (!article.value) {
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
      <ArrowRightOutlined aria-hidden="true" style="transform: rotate(180deg)" />
      {{ $t('nav.news') }}
    </NuxtLink>
  </PageContainer>
</template>

<style scoped lang="scss">
.page-meta--article {
  margin-bottom: 14px;
  font-size: 14px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
</style>
