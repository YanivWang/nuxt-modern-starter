<!--
  【公开区 404 兜底页】

  【文件职责】
    catch-all 友好 404：未匹配的公开路径展示错误文案与回首页链接。

  【架构位置】
    公开 SEO 区 — app/pages/[[language]]/[...slug].vue，default layout。

  路由：任意未匹配的公开路径（如 /foo、/en/unknown-page）
  Layout：default

  UI 区块：
  - 404 eyebrow、错误标题、错误描述
  - 「返回首页」链接 → /

  用户流程：
  - 访问不存在的公开 URL → 展示友好 404 页 → 可回首页

  【依赖关系】
  - 依赖：i18n error.*、usePageSeo（noindex）、setResponseStatus
  - 被引用：Nuxt 文件路由 catch-all

  【渲染 / 数据】
    SSR；无 API；HTTP 404 + noindex。

  【边界与注意】
    不支持的语言前缀（如 /xx/*）由 app/middleware/locale.global.ts 单独 404，不走本页。
    usePageSeo noindex 不输出 hreflang alternate。
-->
<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const languageStore = useLanguageStore()
const { localePath } = useLocalePath()
const { t } = useI18n()

// 公开区 catch-all：HTTP 404 + noindex（不支持语言前缀的 404 由 locale middleware 处理）
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
  <PageContainer layout="compact">
    <div class="page-empty-state page-empty-state--compact">
      <p class="page-eyebrow">404</p>
      <h1 class="page-title">{{ $t('error.title') }}</h1>
      <p class="page-lead">{{ $t('error.message') }}</p>
      <NuxtLink :to="localePath('/')" class="page-back-link">
        {{ $t('common.backHome') }}
      </NuxtLink>
    </div>
  </PageContainer>
</template>
