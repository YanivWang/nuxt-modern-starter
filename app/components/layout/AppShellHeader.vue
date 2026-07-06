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
</script>

<style scoped lang="scss">
.app-shell-header {
  position: sticky;
  top: 0;
  z-index: 40;
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
