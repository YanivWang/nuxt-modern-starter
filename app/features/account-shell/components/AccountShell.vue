<!--
  【文件职责】
    账户 layout shell：顶栏 Logo + UserAccountMenu，左侧 accountNav 侧栏 + 主内容 slot。
    与 ProductShell 视觉分离，专用于 /account 设置流。

  【架构位置】
    登录产品区 — app/features/account-shell，由 app/layouts/account.vue 挂载。

  【主要导出 / 路由】
    AccountShell；侧栏 /account

  【依赖关系】
    - 依赖：config accountNavItems、BaseLogo、UserAccountMenu、AppContainer
    - 被引用：app/layouts/account.vue

  【渲染 / 数据】
    CSR；localePath 对产品 path /account 保持语言中性。

  【边界与注意】
    不含 product-shell 工作台导航；logout 在 UserAccountMenu / AccountPage 处理。
-->
<script setup lang="ts">
import UserAccountMenu from '~/components/layout/UserAccountMenu.vue'
import { UserOutlined } from '~/utils/antdIcon'
import { accountNavItems } from '../config'

const { localePath } = useLocalePath()

const navIconMap = {
  UserOutlined
} as const

const resolveNavIcon = (icon: string) => navIconMap[icon as keyof typeof navIconMap] ?? UserOutlined
</script>

<template>
  <div class="account-shell">
    <header class="account-shell__header">
      <AppContainer class="account-shell__header-inner">
        <BaseLogo />
        <div class="account-shell__header-actions">
          <UserAccountMenu />
        </div>
      </AppContainer>
    </header>

    <AppContainer class="account-shell__body">
      <aside class="account-shell__sidebar" aria-label="Account navigation">
        <nav class="account-shell__nav">
          <NuxtLink
            v-for="item in accountNavItems"
            :key="item.path"
            :to="localePath(item.path)"
            class="account-shell__nav-link"
          >
            <component :is="resolveNavIcon(item.icon)" aria-hidden="true" />
            <span>{{ $t(item.labelKey) }}</span>
          </NuxtLink>
        </nav>
      </aside>

      <main class="account-shell__main">
        <slot />
      </main>
    </AppContainer>
  </div>
</template>

<style scoped lang="scss">
.account-shell {
  --account-accent: #7f3dff;
  --account-accent-soft: rgb(127 61 255 / 10%);
  --account-page-bg: #f5f5f7;

  min-height: 100vh;
  background: var(--account-page-bg);
}

.account-shell__header {
  position: sticky;
  top: 0;
  z-index: 40;
  border-bottom: 1px solid rgb(15 23 42 / 6%);
  background: #ffffff;
}

.account-shell__header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: var(--app-header-control-size);
  padding-block: 16px;
}

.account-shell__header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.account-shell__body {
  display: grid;
  gap: 24px;
  padding-block: clamp(24px, 4vw, 36px);
  grid-template-columns: minmax(220px, 260px) minmax(0, 1fr);
  align-items: start;
}

.account-shell__sidebar {
  padding: 10px;
  border: 1px solid rgb(15 23 42 / 6%);
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 1px 2px rgb(15 23 42 / 4%);
}

.account-shell__nav {
  display: grid;
  gap: 4px;
}

.account-shell__nav-link {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 8px;
  color: #4b5563;
  font-size: 15px;
  font-weight: 500;
  text-decoration: none;
  transition:
    background 0.2s ease,
    color 0.2s ease;

  :deep(.anticon) {
    font-size: 18px;
  }

  &:hover {
    color: #111827;
    background: rgb(15 23 42 / 4%);
  }

  &.router-link-active {
    background: var(--account-accent-soft);
    color: var(--account-accent);

    :deep(.anticon) {
      color: var(--account-accent);
    }
  }
}

.account-shell__main {
  min-width: 0;
}

@media (width <= 860px) {
  .account-shell__body {
    grid-template-columns: 1fr;
  }
}
</style>
