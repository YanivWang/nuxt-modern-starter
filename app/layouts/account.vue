<!--
  【文件职责】
    账户区 layout：委托 AccountShell 包裹账户侧栏与设置主内容。
    用于 /account 独立账户 layout（非 product-shell）。

  【架构位置】
    登录产品区 — app/layouts，/account 路由使用。

  【主要导出 / 路由】
    account layout；/account

  【依赖关系】
    - 依赖：~/features/account-shell（AccountShell）
    - 被引用：app/pages/account.vue

  【渲染 / 数据】
    CSR；入口在用户菜单 UserAccountMenu → /account。

  【边界与注意】
    须配合 middleware: 'auth'；logout 跳转逻辑在 UserAccountMenu / AccountPage。
-->
<template>
  <AccountShell>
    <slot />
  </AccountShell>
</template>

<script setup lang="ts">
import { AccountShell } from '~/features/account-shell'
</script>
