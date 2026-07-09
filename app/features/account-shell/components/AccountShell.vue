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

// 账户 shell 与 product-shell 分离；侧栏仅 accountNavItems，无工作台导航
const navIconMap = {
  UserOutlined
} as const

const resolveNavIcon = (icon: string) => navIconMap[icon as keyof typeof navIconMap] ?? UserOutlined
</script>

<template>
  <div class="account-shell app-product-page">
    <header class="account-shell__header app-product-header">
      <AppContainer class="account-shell__header-inner app-product-header__inner">
        <BaseLogo />
        <div class="account-shell__header-actions">
          <UserAccountMenu />
        </div>
      </AppContainer>
    </header>

    <AppContainer class="account-shell__body">
      <aside class="account-shell__sidebar app-product-sidebar" aria-label="Account navigation">
        <nav class="account-shell__nav app-shell-nav">
          <NuxtLink
            v-for="item in accountNavItems"
            :key="item.path"
            :to="localePath(item.path)"
            class="account-shell__nav-link app-shell-nav__link"
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
.account-shell__body {
  display: grid;
  gap: var(--app-spacing-lg);
  padding-block: clamp(24px, 4vw, 36px);
  grid-template-columns: minmax(220px, 260px) minmax(0, 1fr);
  align-items: start;
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
