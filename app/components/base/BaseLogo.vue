<template>
  <NuxtLink class="base-logo" :to="localePath('/')">
    <span class="base-logo__mark">N</span>
    <span>{{ appConfig.brand.name }}</span>
  </NuxtLink>
</template>

<script setup lang="ts">
const appConfig = useAppConfig()
const { localePath } = useLocalePath()
</script>

<style scoped lang="scss">
.base-logo {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--app-color-text);
  font-weight: 800;
  text-decoration: none;
}

.base-logo__mark {
  display: inline-grid;
  width: var(--app-header-control-size);
  height: var(--app-header-control-size);
  place-items: center;
  border-radius: 10px;
  background: var(--app-color-primary);
  color: #ffffff;
}
</style>
