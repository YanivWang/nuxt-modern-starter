<!--
  【文件职责】
    新闻文章卡片列表 + 归档翻页导航。索引页（/news）与归档页（/news/page/N）共用同一实现。

  【架构位置】
    通用 — app/components/base，auto-import 为 NewsArticleList（pathPrefix: false）。

  【主要导出 / 路由】
    NewsArticleList

  【依赖关系】
    - 依赖：config/routes.ts（newsArchivePath、newsTotalPages）、useLocalePath、formatPublishedDate
    - 被引用：app/pages/[[language]]/news/index.vue、news/page/[page].vue

  【渲染 / 数据】
    纯展示组件，不自己取数；文章与分页元信息由页面以 props 传入。

  【边界与注意】
    翻页链接是真实 <NuxtLink>，不是按钮 —— 归档页要能被爬取，客户端渲染的分页对收录没用。
    news-pagination__link--prev/--next 类名供 E2E 定位：按文案选会绑死在某一种语言上。
    第 1 页链接指向 /news 而不是 /news/page/1：后者会 301，站内链接不该指向必然跳转的 URL。
-->
<script setup lang="ts">
import { computed } from 'vue'
import { ArrowRightOutlined } from '~/utils/antdIcon'
import { NEWS_PAGE_SIZE, newsArchivePath, newsTotalPages } from '../../../config/routes'
import { formatPublishedDate } from '../../utils/formatDate'
import type { LocalizedNewsArticleSummary } from '~/api/public'
import type { SupportedLocale } from '../../../config/site'

const props = defineProps<{
  articles: LocalizedNewsArticleSummary[]
  locale: SupportedLocale
  /** 当前页码，从 1 起 */
  currentPage: number
  /** 文章总数，用于算总页数 */
  total: number
}>()

const { localePath } = useLocalePath()

const totalPages = computed(() => newsTotalPages(props.total, NEWS_PAGE_SIZE))

/** 第 1 页的 canonical 入口是 /news 本身，不是 /news/page/1。 */
const pagePath = (page: number) => (page <= 1 ? '/news' : newsArchivePath(page))

const previousPath = computed(() =>
  props.currentPage > 1 ? localePath(pagePath(props.currentPage - 1)) : null
)
const nextPath = computed(() =>
  props.currentPage < totalPages.value ? localePath(pagePath(props.currentPage + 1)) : null
)
</script>

<template>
  <div class="page-grid news-list">
    <a-card
      v-for="article in articles"
      :key="article.slug"
      class="page-surface-card news-card"
      :bordered="false"
    >
      <p class="page-meta">
        {{ formatPublishedDate(article.publishedAt, locale) }}
      </p>
      <h2 class="news-card__title">{{ article.title }}</h2>
      <p class="news-card__description">{{ article.description }}</p>
      <NuxtLink :to="localePath(`/news/${article.slug}`)" class="page-text-link">
        {{ $t('common.readMore') }}
        <ArrowRightOutlined aria-hidden="true" />
      </NuxtLink>
    </a-card>
  </div>

  <nav
    v-if="totalPages > 1"
    class="news-pagination"
    :aria-label="$t('news.pagination.status', { page: currentPage, total: totalPages })"
  >
    <NuxtLink
      v-if="previousPath"
      :to="previousPath"
      rel="prev"
      class="page-text-link news-pagination__link news-pagination__link--prev"
    >
      {{ $t('news.pagination.previous') }}
    </NuxtLink>
    <span v-else class="news-pagination__placeholder" aria-hidden="true" />

    <span class="page-meta news-pagination__status">
      {{ $t('news.pagination.status', { page: currentPage, total: totalPages }) }}
    </span>

    <NuxtLink
      v-if="nextPath"
      :to="nextPath"
      rel="next"
      class="page-text-link news-pagination__link news-pagination__link--next"
    >
      {{ $t('news.pagination.next') }}
    </NuxtLink>
    <span v-else class="news-pagination__placeholder" aria-hidden="true" />
  </nav>
</template>

<style scoped lang="scss">
.news-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 2rem;
}

.news-pagination__status {
  flex: 1;
  text-align: center;
}

.news-pagination__placeholder {
  flex: 0 0 auto;
  min-width: 1px;
}
</style>
