<!--
  【帮助中心】

  【文件职责】
    公开帮助页：快速上手步骤、文档资源清单与 FAQ 折叠面板。

  【架构位置】
    公开 SEO 区 — app/pages/[[language]]，default layout，PUBLIC_PAGE_PATHS + prerender。

  路由：/help、/en/help
  Layout：default

  UI 区块：
  - 页头：标题、导语
  - Quick Start：4 步有序指引（install → dev → explore → extend）
  - Resources：4 项文档资源清单（architecture / usage / conventions / deployment）
  - FAQ：a-collapse 折叠面板，逐项展示问答

  用户流程：
  - 访客查阅上手步骤与 FAQ；定价页 Growth 方案 CTA 也会跳转至此

  【依赖关系】
  - 依赖：getFaqItems → config/content/faq.ts、i18n help.*、usePageSeo
  - 被引用：AppHeader、AppFooter、pricing Growth CTA

  【渲染 / 数据】
    prerender；FAQ 本地 config 按 locale 过滤，不经远程 API。

  子组件：
  - PageContainer、CheckOutlined 图标

  【边界与注意】
    usePageSeo 完整 hreflang；FAQ 可后续替换为 CMS 而不改页面结构。
-->
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { CheckOutlined } from '~/utils/antdIcon'
import { getFaqItems } from '~/api/public'

const languageStore = useLanguageStore()
const { t } = useI18n()
// FAQ 从 config/content/faq.ts 按 locale 解析，不经远程 API
const faqItems = computed(() => getFaqItems(languageStore.currentLanguage))

const quickStartStepKeys = ['install', 'dev', 'explore', 'extend'] as const

const quickStartSteps = computed(() =>
  quickStartStepKeys.map((key) => t(`help.quickStart.steps.${key}`))
)

const resourceKeys = ['architecture', 'usage', 'conventions', 'deployment'] as const

const resources = computed(() => resourceKeys.map((key) => t(`help.resources.${key}`)))

usePageSeo({
  path: '/help',
  locale: languageStore.currentLanguage,
  title: t('help.title'),
  description: t('help.lead')
})
</script>

<template>
  <PageContainer>
    <h1 class="page-title">{{ $t('help.title') }}</h1>
    <p class="page-lead">{{ $t('help.lead') }}</p>

    <section class="page-panel">
      <h2 class="page-panel__title">{{ $t('help.quickStart.title') }}</h2>
      <ol class="page-step-list help-steps">
        <li v-for="step in quickStartSteps" :key="step">{{ step }}</li>
      </ol>
    </section>

    <section class="page-panel">
      <h2 class="page-panel__title">{{ $t('help.resources.title') }}</h2>
      <ul class="page-check-list help-resources">
        <li v-for="resource in resources" :key="resource">
          <CheckOutlined class="page-check-list__icon" aria-hidden="true" />
          <span>{{ resource }}</span>
        </li>
      </ul>
    </section>

    <section class="page-panel">
      <h2 class="page-panel__title">{{ $t('help.faqTitle') }}</h2>
      <a-collapse class="page-faq" :bordered="false">
        <a-collapse-panel v-for="item in faqItems" :key="item.key" :header="item.question">
          {{ item.answer }}
        </a-collapse-panel>
      </a-collapse>
    </section>
  </PageContainer>
</template>
