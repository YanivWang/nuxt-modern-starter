<!--
  【新闻归档分页页】

  【文件职责】
    新闻索引第 2 页起：服务端渲染的编号归档页，每页与 /news 同样的卡片列表与翻页导航。

  【架构位置】
    公开 SEO 区 — app/pages/[[language]]/news/page，default layout，落在 /news/** 的 SWR 规则内。

  路由：/news/page/:page、/en/news/page/:page
  Layout：default

  UI 区块：
  - 页头：标题（含页码）、导语
  - 文章列表：与索引页共用 NewsArticleList
  - 翻页导航：上一页 / 下一页

  用户流程：
  - 从 /news 点「下一页」进入 → 继续翻页或点开某篇详情

  【依赖关系】
  - 依赖：~/api/public fetchNewsArticles、NewsArticleList、usePageSeo、config/routes
  - 被引用：/news 的翻页链接、sitemap（第 2 页起）

  【渲染 / 数据】
    SSR，命中 config/routes.ts 里 '/news/**' 的 SWR 1h 规则。
    offset 由页码算出：(page - 1) * NEWS_PAGE_SIZE。

  子组件：
  - PageContainer、NewsArticleList

  【边界与注意】
    非法页码（0、负数、小数、超出总页数）一律 404，不做「夹到最近一页」——
    夹取会让任意 /news/page/9999 都返回 200，等于给爬虫制造无限份重复内容。
    page=1 不在这里处理：canonicalRequestPath 会把它 301 折回 /news。
-->
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { fetchNewsArticles } from '~/api/public'
import { resolveUpstreamPageStatus } from '~/lib/http/error'
import { NEWS_PAGE_SIZE, newsArchivePath, newsTotalPages } from '../../../../../config/routes'

const route = useRoute()
const languageStore = useLanguageStore()
const { t } = useI18n()
const nuxtApp = useNuxtApp()

const rawPage = route.params.page as string

/** 只接受不带前导零的正整数：'01'、'1.0'、'1e2' 都不是合法页码，也不该各自成为一个可收录 URL。 */
const parsedPage = /^[1-9]\d*$/.test(rawPage) ? Number(rawPage) : null

if (parsedPage === null) {
  throw createError({ statusCode: 404, statusMessage: 'news.notFound' })
}

const currentPage = parsedPage

const { data: newsList, error } = await useAsyncData(
  () => `news-articles:${languageStore.currentLanguage}:${currentPage}`,
  () =>
    fetchNewsArticles(languageStore.currentLanguage, {
      limit: NEWS_PAGE_SIZE,
      offset: (currentPage - 1) * NEWS_PAGE_SIZE
    }).then((response) => response.data),
  {
    watch: [() => languageStore.currentLanguage, () => currentPage],
    getCachedData(key) {
      return nuxtApp.payload.data[key] ?? nuxtApp.static.data[key]
    }
  }
)

if (error.value) {
  // 与详情页同一判据：区分「这一页不存在」与「后端此刻挂了」
  const statusCode = resolveUpstreamPageStatus(error.value)

  throw createError({
    statusCode,
    statusMessage: statusCode === 404 ? 'news.notFound' : 'error.title'
  })
}

const totalPages = computed(() => newsTotalPages(newsList.value?.pagination.total ?? 0))

// 超出总页数的页码是死链，不是空列表页。返回 200 空页会让 /news/page/9999 这类 URL
// 全部变成可收录的重复内容。
if (currentPage > totalPages.value) {
  throw createError({ statusCode: 404, statusMessage: 'news.notFound' })
}

usePageSeo({
  path: newsArchivePath(currentPage),
  locale: languageStore.currentLanguage,
  title: t('news.archiveTitle', { page: currentPage }),
  description: t('news.lead')
})
</script>

<template>
  <PageContainer>
    <h1 class="page-title">{{ $t('news.archiveTitle', { page: currentPage }) }}</h1>
    <p class="page-lead">{{ $t('news.lead') }}</p>

    <NewsArticleList
      :articles="newsList?.articles ?? []"
      :locale="languageStore.currentLanguage"
      :current-page="currentPage"
      :total="newsList?.pagination.total ?? 0"
    />
  </PageContainer>
</template>
