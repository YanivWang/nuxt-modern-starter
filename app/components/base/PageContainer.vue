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

  padding-block: clamp(56px, 10vw, 112px);

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
