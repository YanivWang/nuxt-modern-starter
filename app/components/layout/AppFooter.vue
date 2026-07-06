<template>
  <footer class="app-footer">
    <AppContainer class="app-footer__inner">
      <span>{{ $t('brand.tagline') }}</span>
      <div class="app-footer__links">
        <NuxtLink :to="localePath('/about')">{{ $t('nav.about') }}</NuxtLink>
        <NuxtLink :to="localePath('/help')">{{ $t('nav.help') }}</NuxtLink>
      </div>
    </AppContainer>
  </footer>
</template>

<script setup lang="ts">
const { localePath } = useLocalePath()
</script>

<style scoped lang="scss">
.app-footer {
  border-top: 1px solid var(--app-color-border);
  color: var(--app-color-muted);
}

.app-footer__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding-block: 20px;
}

.app-footer__links {
  display: flex;
  align-items: center;
  gap: 20px;
}

.app-footer a {
  color: inherit;
  text-decoration: none;
}
</style>
