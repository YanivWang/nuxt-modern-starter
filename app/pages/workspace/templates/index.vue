<!--
  【主题模板页（占位）】

  【文件职责】
    主题模板占位薄页：委托 ThemeTemplatesPage 展示未来模板选择 UI。

  【架构位置】
    登录产品区 — app/pages/workspace/templates，product layout。

  路由：/workspace/templates
  Layout：product | 鉴权：app/middleware/auth.ts | 渲染：CSR

  UI 区块（由 ThemeTemplatesPage 渲染）：
  - 页头：标题 + 占位说明文案
  - 6 张虚线占位卡片（aria-hidden 装饰）
  - a-empty 空状态提示

  用户流程：
  - 从 product-shell 侧边栏进入 → 查看占位 UI（暂无实际模板选择功能）

  【依赖关系】
  - 依赖：~/features/templates ThemeTemplatesPage、product-shell productNavItems
  - 被引用：product-shell 侧边栏「主题模版」

  【渲染 / 数据】
    CSR + noindex；无后端 API（placeholder）。

  子组件：
  - ThemeTemplatesPage（app/features/templates）

  【边界与注意】
    可安全删除或替换为真实模板功能；share/download/favorite 等未在此页实现。
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
