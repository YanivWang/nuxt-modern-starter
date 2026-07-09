<!--
  【文件职责】
    主题切换按钮：toggle light / dark resolvedMode，显示 Sun / Moon 图标。
    写入 localStorage 与 document dataset.theme（经 useTheme）。

  【架构位置】
    通用 — app/components/layout，公开 header 与可复用场景。

  【主要导出 / 路由】
    ThemeSwitch

  【依赖关系】
    - 依赖：useTheme composable
    - 被引用：AppHeader

  【渲染 / 数据】
    client-only 交互；SSR 渲染默认 light 图标态。

  【边界与注意】
    role=switch + aria-checked 供无障碍。
-->
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

// toggleTheme 写入显式 light/dark（非 system），并同步 localStorage + document dataset
const isDark = computed(() => resolvedMode.value === 'dark')
</script>

<style scoped lang="scss">
.theme-switch {
  font: inherit;
}
</style>
