<!--
  【文件职责】
    Ant Design Button 薄封装：统一默认 type=primary、size=large。
    公开页 CTA 与表单提交按钮的样式基线。

  【架构位置】
    通用 — app/components/base，auto-import 为 BaseButton。

  【主要导出 / 路由】
    BaseButton

  【依赖关系】
    - 依赖：Ant Design Vue a-button
    - 被引用：pricing、home 等公开页 CTA

  【渲染 / 数据】
    无

  【边界与注意】
    产品区复杂交互可直接用 a-button，不必强制 BaseButton。
-->
<template>
  <a-button :type="type" :size="size">
    <slot />
  </a-button>
</template>

<script setup lang="ts">
// 公开页 CTA 默认 primary + large；产品区可直接用 a-button
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
