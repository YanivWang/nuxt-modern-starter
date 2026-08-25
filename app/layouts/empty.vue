<!--
  【文件职责】
    空 layout：仅渲染 slot，无 header / footer / shell。
    app/error.vue 用它包裹错误页；其余需要完全自定义页面结构的场景也可显式指定。

  【架构位置】
    共享层 — app/layouts，按需显式指定。

  【主要导出 / 路由】
    empty layout

  【依赖关系】
    - 依赖：无
    - 被引用：app/error.vue（<NuxtLayout name="empty">）；页面可按需显式指定

  【渲染 / 数据】
    无额外 wrapper；与页面自身 markup 一致。

  【边界与注意】
    使用 empty 时页面须自行处理 SEO、导航与 noindex。
-->
<template>
  <!-- 无 header/footer；页面须自行处理 SEO 与导航 -->
  <slot />
</template>
