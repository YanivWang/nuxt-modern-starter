/*
  【文件职责】
    editor feature 对外导出面：EditorWorkspace 与页面级 useEditorPage。

  【架构位置】
    登录产品区 — app/features/editor barrel。

  【主要导出 / 路由】
    EditorWorkspace、useEditorPage

  【依赖关系】
    - 依赖：./components/EditorWorkspace.vue、./composables/useEditorPage
    - 被引用：app/pages/docs/[id].vue、WorkspaceDashboard prefetch

  【渲染 / 数据】
    无 — 页面只使用 feature barrel，feature 内部组件/composables 不被页面深引。
*/
// 页面只从 barrel 获取入口；内部 composables/components 由 page-structure.test.ts 禁止深引。
export { default as EditorWorkspace } from './components/EditorWorkspace.vue'
export { useEditorPage } from './composables/useEditorPage'
