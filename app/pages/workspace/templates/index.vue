<!--
  【主题模板页（占位）】

  路由：/workspace/templates
  Layout：product | 鉴权：auth 中间件 | 渲染：CSR

  UI 区块（由 ThemeTemplatesPage 渲染）：
  - 页头：标题 + 占位说明文案
  - 6 张虚线占位卡片（aria-hidden 装饰）
  - a-empty 空状态提示

  用户流程：
  - 从 product-shell 侧边栏进入 → 查看占位 UI（暂无实际模板选择功能）

  数据 / API：
  - 无后端 API；docs/deployment.md 标注为 placeholder

  子组件：
  - ThemeTemplatesPage（app/features/templates）

  SEO / 边界：
  - noindex；仅 productNavItems 侧边栏有入口，可安全删除或替换为真实模板功能
-->
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ThemeTemplatesPage } from '~/features/templates'

definePageMeta({
  layout: 'product',
  middleware: 'auth'
})

const languageStore = useLanguageStore()
const { t } = useI18n()

usePageSeo({
  path: '/workspace/templates',
  locale: languageStore.currentLanguage,
  title: t('productNav.themeTemplates'),
  description: t('templates.empty'),
  noindex: true
})
</script>

<template>
  <ThemeTemplatesPage />
</template>
