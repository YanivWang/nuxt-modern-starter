<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ArrowRightOutlined } from '~/utils/antdIcon'
import { getNewsArticles } from '../../../apis/public/content'
import { formatPublishedDate } from '../../../utils/formatDate'

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
    <p class="page-eyebrow">{{ $t('news.eyebrow') }}</p>
    <h1 class="page-title">{{ $t('news.title') }}</h1>
    <p class="page-lead">{{ $t('news.lead') }}</p>

    <div class="page-grid news-list">
      <a-card
        v-for="article in articles"
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
