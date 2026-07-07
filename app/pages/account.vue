<!--
  【账户设置页】

  【文件职责】
    账户信息薄页：委托 AccountPage 展示 profile 与退出入口。

  【架构位置】
    登录产品区 — app/pages/account.vue，account layout，语言中性 URL /account。

  路由：/account（语言中性 URL）
  Layout：account | 鉴权：app/middleware/auth.ts | 渲染：CSR

  UI 区块（由 AccountPage 渲染）：
  - 设置卡片（loading 态支持）：
    - 头像（图片或 initials 首字母）
    - 昵称（空则显示 -）
    - 用户名
    - 扩展 profile 字段（API 返回的键值对）
    - 会话区：退出登录按钮

  用户流程：
  - 从 UserAccountMenu 进入 → 查看账户信息 → 点击退出

  【依赖关系】
  - 依赖：~/features/account AccountPage、fetchProfileApi（adapter /me/profile）
  - 被引用：UserAccountMenu → /account

  【渲染 / 数据】
    CSR + noindex；AccountPage 内 fetchProfileApi 加载 profile。

  子组件：
  - AccountPage（app/features/account）

  【边界与注意】
    authStore.logout() 仅清 session；AccountPage handleLogout 在 await logout() 后 router.push(localePath('/'))。
    仅用户菜单入口，不影响 workspace → editor 主流程。
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
