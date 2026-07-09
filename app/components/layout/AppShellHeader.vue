<!--
  【文件职责】
    产品 shell 顶栏骨架：actions-before / actions-after 插槽，默认右侧 UserAccountMenu。
    由 ProductShell 挂载，编辑器 layout 不使用。

  【架构位置】
    登录产品区 — app/components/layout，product-shell feature 消费。

  【主要导出 / 路由】
    AppShellHeader

  【依赖关系】
    - 依赖：UserAccountMenu（默认 slot）
    - 被引用：app/features/product-shell/components/ProductShell.vue

  【渲染 / 数据】
    CSR 产品区 sticky header。

  【边界与注意】
    与公开 AppHeader 分离；账户 layout 使用 AccountShell 自有 header。
-->
<template>
  <header class="app-shell-header">
    <div class="app-shell-header__inner">
      <div class="app-shell-header__start">
        <slot name="actions-before" />
      </div>
      <div class="app-shell-header__end">
        <slot name="actions-after">
          <UserAccountMenu />
        </slot>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import UserAccountMenu from './UserAccountMenu.vue'
// 默认 actions-after 为 UserAccountMenu；产品区无 AppHeader
</script>

<style scoped lang="scss">
.app-shell-header {
  position: sticky;
  top: 0;
  z-index: var(--app-z-index-sticky);
  flex-shrink: 0;
  border-bottom: 1px solid var(--app-color-border);
  background: var(--app-color-bg);
}

.app-shell-header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 56px;
  padding: 8px clamp(16px, 3vw, 24px);
}

.app-shell-header__start,
.app-shell-header__end {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.app-shell-header__end {
  margin-inline-start: auto;
}
</style>
