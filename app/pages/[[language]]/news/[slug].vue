<script setup lang="ts">
import { getLocalizedNewsArticle } from '../../../apis/content'

const route = useRoute()
const languageStore = useLanguageStore()
const { localePath } = useLocalePath()
const slug = route.params.slug as string
const article = computed(() => getLocalizedNewsArticle(slug, languageStore.currentLanguage))

if (!article.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'News article not found'
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
    <p class="page-eyebrow">{{ article.publishedAt }}</p>
    <h1 class="page-title">{{ article.title }}</h1>
    <p class="page-lead">{{ article.description }}</p>
    <article class="news-article">
      <p>{{ article.body }}</p>
    </article>
    <NuxtLink :to="localePath('/news')">{{ $t('nav.news') }}</NuxtLink>
  </PageContainer>
</template>

<style scoped lang="scss">
.news-article {
  max-width: 760px;
  margin: 40px 0;
  color: var(--app-color-text);
  font-size: 18px;
  line-height: 1.8;
}
</style>
