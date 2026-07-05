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
