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
