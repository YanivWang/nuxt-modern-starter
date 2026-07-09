<!--
  【文件职责】
    水平居中内容容器：应用 --app-container-max 与 padding，无额外 vertical spacing。
    比 PageContainer 更底层，用于 header / footer 等 shell 区域。

  【架构位置】
    通用 — app/components/base，auto-import 为 AppContainer。

  【主要导出 / 路由】
    AppContainer

  【依赖关系】
    - 依赖：main.scss .app-container 样式
    - 被引用：AppHeader、AppFooter

  【渲染 / 数据】
    无

  【边界与注意】
    公开页主内容通常用 PageContainer（含 padding-block），shell 用 AppContainer。
-->
<template>
  <!-- 水平居中容器；公开页主内容区用 PageContainer（含 padding-block） -->
  <div class="app-container">
    <slot />
  </div>
</template>
