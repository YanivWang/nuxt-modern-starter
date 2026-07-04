<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { getNewsArticles } from '../../../apis/content'

const languageStore = useLanguageStore()
const { localePath } = useLocalePath()
const { t } = useI18n()
const articles = computed(() => getNewsArticles(languageStore.currentLanguage))

usePageSeo({
  path: '/news',
  locale: languageStore.currentLanguage,
  title: t('news.title'),
  description: t('news.lead')
})
</script>

<template>
  <PageContainer>
    <p class="page-eyebrow">News</p>
    <h1 class="page-title">{{ $t('news.title') }}</h1>
    <p class="page-lead">{{ $t('news.lead') }}</p>
    <div class="news-list">
      <a-card v-for="article in articles" :key="article.slug" :title="article.title">
        <p>{{ article.description }}</p>
        <p class="news-list__date">{{ article.publishedAt }}</p>
        <NuxtLink :to="localePath(`/news/${article.slug}`)">{{ $t('common.readMore') }}</NuxtLink>
      </a-card>
    </div>
  </PageContainer>
</template>

<style scoped lang="scss">
.news-list {
  display: grid;
  gap: 20px;
  margin-top: 40px;
}

.news-list__date {
  color: var(--app-color-muted);
}
</style>
