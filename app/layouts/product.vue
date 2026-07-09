<!--
  【文件职责】
    产品区 layout：委托 ProductShell 包裹 sidebar + header + 主内容区。
    用于工作台与主题模板等产品 CSR 页面。

  【架构位置】
    登录产品区 — app/layouts，workspace / templates 路由使用。

  【主要导出 / 路由】
    product layout；/workspace、/workspace/templates

  【依赖关系】
    - 依赖：~/features/product-shell（ProductShell）
    - 被引用：app/pages/workspace/index.vue、workspace/templates/index.vue

  【渲染 / 数据】
    CSR（ssr: false）；shell 内含 UserAccountMenu、product 侧边导航。

  【边界与注意】
    须配合 middleware: 'auth' 与 usePageSeo({ noindex: true })。
-->
<template>
  <ProductShell>
    <slot />
  </ProductShell>
</template>

<script setup lang="ts">
// product layout 统一 CSR + auth；侧栏与 header 由 ProductShell 提供
import { ProductShell } from '~/features/product-shell'
</script>
