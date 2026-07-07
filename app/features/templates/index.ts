/*
  【文件职责】
    templates feature 对外导出面：ThemeTemplatesPage 占位组件。

  【架构位置】
    登录产品区 — app/features/templates barrel。

  【主要导出 / 路由】
    ThemeTemplatesPage

  【依赖关系】
    - 依赖：./components/ThemeTemplatesPage.vue
    - 被引用：app/pages/workspace/templates/index.vue

  【渲染 / 数据】
    无 — 纯 re-export。

  【边界与注意】
    占位 UI，无 API；可整 feature 替换为真实模板选择。
*/
export { default as ThemeTemplatesPage } from './components/ThemeTemplatesPage.vue'
