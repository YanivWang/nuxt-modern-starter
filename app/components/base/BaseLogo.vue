<!--
  【文件职责】
    站点 Logo 链接：品牌 mark + app.config 品牌名，点击回首页 localePath('/')。
    用于公开 header 与需要品牌入口的位置。

  【架构位置】
    通用 — app/components/base，auto-import 为 BaseLogo。

  【主要导出 / 路由】
    BaseLogo → localePath('/')

  【依赖关系】
    - 依赖：useAppConfig、useLocalePath
    - 被引用：AppHeader

  【渲染 / 数据】
    无

  【边界与注意】
    品牌名来自 app/app.config.ts，非 i18n 文案。
-->
<template>
  <NuxtLink class="base-logo" :to="localePath('/')">
    <span class="base-logo__mark">N</span>
    <span>{{ appConfig.brand.name }}</span>
  </NuxtLink>
</template>

<script setup lang="ts">
const appConfig = useAppConfig()
const { localePath } = useLocalePath()
// 品牌名来自 app.config.ts，非 i18n；链接回当前语言首页
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
  color: var(--app-color-brand-contrast);
}
</style>
