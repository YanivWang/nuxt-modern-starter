<!--
  【文件职责】
    公开站页脚：品牌 tagline 与 about / help 次要链接。
    与 AppHeader 配对构成 default layout 底部。

  【架构位置】
    公开 SEO 区 — app/components/layout，由 default layout 引用。

  【主要导出 / 路由】
    AppFooter

  【依赖关系】
    - 依赖：useLocalePath
    - 被引用：app/layouts/default.vue

  【渲染 / 数据】
    无

  【边界与注意】
    tagline 来自 i18n brand.tagline。
-->
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
// 次要导航 about/help；链接须 localePath 以支持 /en 前缀
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
