<!--
  【文件职责】
    主题模板占位页：虚线卡片网格 + a-empty，无选择与 API 交互。

  【架构位置】
    登录产品区 — app/features/templates，product layout 下渲染。

  【主要导出 / 路由】
    ThemeTemplatesPage

  【依赖关系】
    - 依赖：i18n templates.empty、productNav.themeTemplates
    - 被引用：app/pages/workspace/templates/index.vue

  【渲染 / 数据】
    CSR 占位；装饰 grid aria-hidden。

  【边界与注意】
    product-shell config 侧栏有入口；实现真实模板时替换本组件即可。
-->
<template>
  <section class="theme-templates-page">
    <header class="theme-templates-page__header">
      <h1 class="theme-templates-page__title">{{ $t('productNav.themeTemplates') }}</h1>
      <p class="theme-templates-page__lead">{{ $t('templates.empty') }}</p>
    </header>
    <div class="theme-templates-page__grid" aria-hidden="true">
      <div v-for="index in 6" :key="index" class="theme-templates-page__card" />
    </div>
    <a-empty class="theme-templates-page__empty" :description="$t('templates.empty')" />
  </section>
</template>

<style scoped lang="scss">
.theme-templates-page__header {
  margin-bottom: 32px;
}

.theme-templates-page__title {
  margin: 0 0 8px;
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 700;
}

.theme-templates-page__lead {
  margin: 0;
  color: var(--app-color-muted);
}

.theme-templates-page__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.theme-templates-page__card {
  aspect-ratio: 16 / 10;
  border: 1px dashed var(--app-color-border);
  border-radius: 12px;
  background: var(--app-color-elevated);
  opacity: 0.45;
}

.theme-templates-page__empty {
  padding: 24px 0;
}
</style>
