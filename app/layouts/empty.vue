<!--
  【文件职责】
    空 layout：仅渲染 slot，无 header / footer / shell。
    供需要完全自定义页面结构的场景预留。

  【架构位置】
    共享层 — app/layouts，按需显式指定。

  【主要导出 / 路由】
    empty layout

  【依赖关系】
    - 依赖：无
    - 被引用：当前 starter 无默认使用页（预留）

  【渲染 / 数据】
    无额外 wrapper；与页面自身 markup 一致。

  【边界与注意】
    使用 empty 时页面须自行处理 SEO、导航与 noindex。
-->
<template>
  <!-- 无 header/footer；页面须自行处理 SEO 与导航 -->
  <slot />
</template>
