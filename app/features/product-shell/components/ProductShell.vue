<script setup lang="ts">
import { FolderOutlined, LayoutOutlined, TagOutlined } from '~/utils/antdIcon'
import { productFooterNavItems, productNavItems } from '../config'

const { localePath } = useLocalePath()

const navIconMap = {
  FolderOutlined,
  LayoutOutlined,
  TagOutlined
} as const

const resolveNavIcon = (icon: string) =>
  navIconMap[icon as keyof typeof navIconMap] ?? FolderOutlined
</script>

<template>
  <div class="product-shell">
    <aside class="product-shell__sidebar" aria-label="Product navigation">
      <BaseLogo />
      <nav class="product-shell__nav">
        <NuxtLink
          v-for="item in productNavItems"
          :key="item.path"
          :to="localePath(item.path)"
          class="product-shell__nav-link"
        >
          <component :is="resolveNavIcon(item.icon)" aria-hidden="true" />
          <span>{{ $t(item.labelKey) }}</span>
        </NuxtLink>
      </nav>
      <nav class="product-shell__footer-nav" aria-label="Product footer navigation">
        <NuxtLink
          v-for="item in productFooterNavItems"
          :key="item.path"
          :to="localePath(item.path)"
          class="product-shell__nav-link product-shell__nav-link--footer"
        >
          <component :is="resolveNavIcon(item.icon)" aria-hidden="true" />
          <span>{{ $t(item.labelKey) }}</span>
        </NuxtLink>
      </nav>
    </aside>

    <div class="product-shell__content">
      <AppShellHeader />
      <main class="product-shell__main">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped lang="scss">
.product-shell {
  display: grid;
  min-height: 100vh;
  grid-template-columns: minmax(220px, 260px) minmax(0, 1fr);
  background: var(--app-color-bg);
}

.product-shell__sidebar {
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding: 24px;
  border-inline-end: 1px solid var(--app-color-border);
  background: var(--app-color-bg);
}

.product-shell__nav,
.product-shell__footer-nav {
  display: grid;
  gap: 8px;
}

.product-shell__footer-nav {
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid var(--app-color-border);
}

.product-shell__nav-link {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  color: var(--app-color-muted);
  font-weight: 600;
  text-decoration: none;
  transition:
    background 0.2s ease,
    color 0.2s ease;

  &:hover {
    color: var(--app-color-text);
    background: rgb(15 23 42 / 4%);
  }

  &.router-link-active {
    background: rgb(22 119 255 / 10%);
    color: var(--app-color-primary);
  }
}

.product-shell__nav-link--footer {
  font-weight: 500;
}

.product-shell__content {
  display: flex;
  min-width: 0;
  flex-direction: column;
  min-height: 100vh;
}

.product-shell__main {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: clamp(24px, 4vw, 48px);
}

@media (width <= 860px) {
  .product-shell {
    grid-template-columns: 1fr;
  }

  .product-shell__sidebar {
    border-inline-end: 0;
    border-bottom: 1px solid var(--app-color-border);
  }

  .product-shell__footer-nav {
    margin-top: 0;
    padding-top: 0;
    border-top: 0;
  }
}
</style>
