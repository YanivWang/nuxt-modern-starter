<template>
  <button
    type="button"
    class="theme-switch app-header__icon-button"
    role="switch"
    :aria-checked="isDark"
    :aria-label="$t('common.switchTheme')"
    @click="toggleTheme"
  >
    <SunOutlined v-if="!isDark" />
    <MoonOutlined v-else />
  </button>
</template>

<script setup lang="ts">
import { MoonOutlined, SunOutlined } from '../../utils/antdIcon'

const { resolvedMode, toggleTheme } = useTheme()

const isDark = computed(() => resolvedMode.value === 'dark')
</script>

<style scoped lang="scss">
.theme-switch {
  font: inherit;
}
</style>
