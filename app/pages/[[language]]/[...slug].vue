<!--
  【公开区 404 兜底页】

  路由：任意未匹配的公开路径（如 /foo、/en/unknown-page）
  Layout：default

  UI 区块：
  - 404 eyebrow、错误标题、错误描述
  - 「返回首页」链接 → /

  用户流程：
  - 访问不存在的公开 URL → 展示友好 404 页 → 可回首页

  数据 / API：
  - 无；纯 i18n 文案（error.*）

  SEO / 边界：
  - setResponseStatus(404) 返回 HTTP 404 状态码
  - noindex 避免未知路径被搜索引擎收录
  - Nuxt catch-all 路由兜底；不支持的语言前缀由 locale middleware 单独处理
-->
<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const languageStore = useLanguageStore()
const { localePath } = useLocalePath()
const { t } = useI18n()

setResponseStatus(404)

usePageSeo({
  path: useRoute().path,
  locale: languageStore.currentLanguage,
  title: t('error.title'),
  description: t('error.message'),
  noindex: true
})
</script>

<template>
  <PageContainer>
    <div class="page-empty-state">
      <p class="page-eyebrow">404</p>
      <h1 class="page-title">{{ $t('error.title') }}</h1>
      <p class="page-lead">{{ $t('error.message') }}</p>
      <NuxtLink :to="localePath('/')" class="page-back-link">
        {{ $t('common.backHome') }}
      </NuxtLink>
    </div>
  </PageContainer>
</template>

<style scoped lang="scss">
.page-empty-state {
  .page-title {
    font-size: clamp(28px, 4vw, 40px);
  }

  .page-lead {
    margin-top: 16px;
    font-size: 16px;
  }

  .page-back-link {
    margin-top: 24px;
  }
}
</style>
