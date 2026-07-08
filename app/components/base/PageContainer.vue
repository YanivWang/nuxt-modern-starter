<!--
  【文件职责】
    公开页内容区容器：统一 padding、max-width 与轻量背景，支持 default / prose / compact 三种宽度模式。
    compact 用于 404 等窄内容；prose 用于长文阅读。

  【架构位置】
    通用 — app/components/base，auto-import 为 PageContainer（pathPrefix: false）。

  【主要导出 / 路由】
    PageContainer、PageContainerLayout

  【依赖关系】
    - 依赖：tokens.scss（--app-content-max-prose 等 CSS 变量）
    - 被引用：pricing、about、help、news 等公开页

  【渲染 / 数据】
    无 — 纯布局组件。

  【边界与注意】
    配合 page-patterns.scss 中 .page-title、.page-lead 等类使用。
-->
<script setup lang="ts">
export type PageContainerLayout = 'default' | 'prose' | 'compact'

withDefaults(
  defineProps<{
    /** default: 占满容器；prose: 长文阅读栏；compact: 居中窄内容（404 等） */
    layout?: PageContainerLayout
  }>(),
  {
    layout: 'default'
  }
)
</script>

<template>
  <section class="page-container app-container" :class="`page-container--${layout}`">
    <slot />
  </section>
</template>

<style scoped lang="scss">
.page-container {
  --page-content-max: 100%;

  position: relative;
  isolation: isolate;
  padding-block: clamp(64px, 9vw, 112px);

  &::before {
    position: absolute;
    inset: 0 max(calc((100vw - var(--app-container-max)) / -2), -24px) auto;
    z-index: -1;
    height: clamp(220px, 32vw, 420px);
    background: var(--app-gradient-page-header);
    content: '';
    pointer-events: none;
  }

  :deep(.page-title),
  :deep(.page-lead) {
    width: 100%;
    margin-inline: auto;
    text-align: center;
  }

  :global(:root[data-theme='dark']) &::before {
    background: var(--app-gradient-page-header);
  }

  &--prose {
    --page-content-max: min(var(--app-content-max-prose), 100%);
  }

  &--compact {
    --page-content-max: min(var(--app-content-max-compact), 100%);
  }

  &--prose,
  &--compact {
    :deep(.page-eyebrow),
    :deep(.page-title),
    :deep(.page-lead),
    :deep(.page-meta),
    :deep(.page-content-block),
    :deep(.page-note),
    :deep(.page-empty-state) {
      margin-inline: auto;
      width: 100%;
    }

    :deep(.page-back-link) {
      margin-inline: auto;
    }
  }
}
</style>
