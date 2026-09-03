<!--
  【文件职责】
    全局错误页：403/404/500 友好 UI，i18n statusMessage 映射，noindex meta。
    使用 empty layout，clearError 回首页。

  【架构位置】
    共享层 — app/error.vue，Nuxt 错误边界。

  【主要导出 / 路由】
    无（框架错误路由）

  【依赖关系】
    - 依赖：vue-i18n error.*、config/site SITE_NAME、config/routes localizedPath、
      language store（回首页要回当前语言的首页）、empty layout
    - 被引用：createError、middleware 403/404

  【渲染 / 数据】
    SSR/CSR 均可；useHead robots noindex,nofollow。

  【边界与注意】
    公开 catch-all 404 用 [[language]]/[...slug].vue；middleware 404 走本页或 dedicated error。
    「返回首页」必须经 localizedPath 加当前语言前缀，不能写死 '/'。
-->
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { SITE_NAME } from '../config/site'
import { localizedPath } from '../config/routes'

const props = defineProps<{
  error: {
    statusCode?: number
    statusMessage?: string
    message?: string
  }
}>()

const { t, te } = useI18n()
const languageStore = useLanguageStore()

/**
 * 回首页要回**当前语言**的首页。
 *
 * 写死 '/' 的话，英文（以及其余 13 个语言）用户点完会落到中文站：
 * '/' 是 zh-CN 的 canonical 首页，而 resolvePreferredLocale 对非产品路径
 * 一律返回 DEFAULT_LOCALE，连语言 cookie 都不看 —— 于是错误页说着英文，
 * 按钮却把人送去中文站。
 */
const handleError = () =>
  clearError({ redirect: localizedPath('/', languageStore.currentLanguage) })

const errorTitle = computed(() => {
  const { statusCode, statusMessage } = props.error

  // statusMessage 为 i18n key（如 error.forbidden）时优先 te/t 翻译
  if (statusMessage && te(statusMessage)) {
    return t(statusMessage)
  }

  if (statusCode === 403) {
    return t('error.forbidden')
  }

  if (statusCode === 404) {
    return t('error.title')
  }

  return t('error.title')
})

useHead({
  title: computed(() => `${errorTitle.value} · ${SITE_NAME}`),
  // 全局错误页一律 noindex，避免搜索引擎收录中间件 403/404
  meta: [{ name: 'robots', content: 'noindex,nofollow' }]
})
</script>

<template>
  <NuxtLayout name="empty">
    <main class="error-page">
      <div class="page-empty-state page-empty-state--compact">
        <p class="page-eyebrow">{{ error.statusCode || 500 }}</p>
        <h1 class="page-title">
          {{ errorTitle }}
        </h1>
        <p class="page-lead">{{ t('error.message') }}</p>
        <button type="button" class="page-back-link" @click="handleError">
          {{ t('common.backHome') }}
        </button>
      </div>
    </main>
  </NuxtLayout>
</template>
