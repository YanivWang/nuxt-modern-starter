<template>
  <footer class="app-footer">
    <span>{{ appConfig.brand.tagline }}</span>
    <NuxtLink :to="localePath('/help')">{{ $t('nav.help') }}</NuxtLink>
  </footer>
</template>

<script setup lang="ts">
const appConfig = useAppConfig()
const { localePath } = useLocalePath()
</script>

<style scoped lang="scss">
.app-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 20px clamp(20px, 6vw, 80px);
  border-top: 1px solid var(--app-color-border);
  color: var(--app-color-muted);
}

.app-footer a {
  color: inherit;
  text-decoration: none;
}
</style>
