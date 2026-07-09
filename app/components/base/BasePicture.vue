<!--
  【文件职责】
    响应式 picture 组件：可选 webp source + fallback img，支持 lazy / fetchpriority。
    用于首页 hero、营销页配图等需要图片格式兜底和 LCP 优化的展示场景。

  【架构位置】
    通用 — app/components/base，auto-import 为 BasePicture。

  【主要导出 / 路由】
    BasePicture

  【依赖关系】
    - 依赖：无
    - 被引用：首页 hero 产品大图

  【渲染 / 数据】
    无 — 默认 loading=lazy。

  【边界与注意】
    须提供有意义 alt；webpSrc 可选。
-->
<script setup lang="ts">
type BasePictureProps = {
  src: string
  webpSrc?: string
  alt: string
  width?: number | string
  height?: number | string
  loading?: 'lazy' | 'eager'
  fetchpriority?: 'high' | 'low' | 'auto'
  sizes?: string
}

const props = withDefaults(defineProps<BasePictureProps>(), {
  webpSrc: undefined,
  width: undefined,
  height: undefined,
  loading: 'lazy',
  fetchpriority: 'auto',
  sizes: undefined
})
// 首页 hero 可设 loading=eager + fetchpriority=high 优化 LCP
</script>

<template>
  <picture>
    <source v-if="props.webpSrc" :srcset="props.webpSrc" type="image/webp" :sizes="props.sizes" />
    <img
      :src="props.src"
      :alt="props.alt"
      :width="props.width"
      :height="props.height"
      :loading="props.loading"
      :fetchpriority="props.fetchpriority"
      :sizes="props.sizes"
    />
  </picture>
</template>
