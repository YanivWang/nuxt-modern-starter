<script setup lang="ts">
import { productNavItems } from '../config'

const { localePath } = useLocalePath()
</script>

<template>
  <div class="product-shell">
    <aside class="product-shell__sidebar" aria-label="Product navigation">
      <BaseLogo />
      <nav class="product-shell__nav">
        <NuxtLink v-for="item in productNavItems" :key="item.path" :to="localePath(item.path)">
          {{ $t(item.labelKey) }}
        </NuxtLink>
      </nav>
    </aside>

    <main class="product-shell__main">
      <slot />
    </main>
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

.product-shell__nav {
  display: grid;
  gap: 8px;

  a {
    padding: 10px 12px;
    border-radius: 10px;
    color: var(--app-color-muted);
    font-weight: 600;
    text-decoration: none;
  }

  a.router-link-active {
    background: rgb(22 119 255 / 10%);
    color: var(--app-color-primary);
  }
}

.product-shell__main {
  min-width: 0;
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
}
</style>
