<!--
  【文件职责】
    编辑器 layout：纯 slot 透传，无全局 header / sidebar。
    EditorWorkspace feature 组件自行承担编辑器 chrome 与 autosave UI。

  【架构位置】
    登录产品区 — app/layouts，/docs/:id、/docs/new 使用。

  【主要导出 / 路由】
    editor layout；/docs/:id、/docs/new

  【依赖关系】
    - 依赖：无（薄 wrapper）
    - 被引用：app/pages/docs/[id].vue

  【渲染 / 数据】
    CSR；全屏编辑体验由 app/features/editor 实现。

  【边界与注意】
    与 product layout 不同，编辑器不显示 product-shell 侧边栏。
-->
<template>
  <slot />
</template>
