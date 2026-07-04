<template>
  <a-button :type="type" :size="size">
    <slot />
  </a-button>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    type?: 'default' | 'primary' | 'dashed' | 'link' | 'text'
    size?: 'small' | 'middle' | 'large'
  }>(),
  {
    type: 'primary',
    size: 'large'
  }
)
</script>
