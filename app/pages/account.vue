<!--
  【账户设置页】

  路由：/account（语言中性 URL）
  Layout：account | 鉴权：auth 中间件 | 渲染：CSR

  UI 区块（由 AccountPage 渲染）：
  - 设置卡片（loading 态支持）：
    - 头像（图片或 initials 首字母）
    - 昵称（空则显示 -）
    - 用户名
    - 扩展 profile 字段（API 返回的键值对）
    - 会话区：退出登录按钮

  用户流程：
  - 从 UserAccountMenu 进入 → 查看账户信息 → 点击退出 → 跳转首页 /

  数据 / API：
  - fetchProfileApi(accessToken) → app/api/auth（加载 profile 详情）
  - useAuth().logout()：清除 token 并退出
  - authStore.user：昵称、用户名等基础信息

  子组件：
  - AccountPage（app/features/account）

  SEO / 边界：
  - noindex；仅用户菜单入口，不影响工作台→编辑器主流程
-->
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { AccountPage } from '~/features/account'

definePageMeta({
  layout: 'account',
  middleware: 'auth'
})

const languageStore = useLanguageStore()
const { t } = useI18n()

usePageSeo({
  path: '/account',
  locale: languageStore.currentLanguage,
  title: t('auth.account.title'),
  description: t('auth.account.lead'),
  noindex: true
})
</script>

<template>
  <AccountPage />
</template>
