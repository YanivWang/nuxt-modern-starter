/*
  【文件职责】
    editor feature 对外导出面：EditorWorkspace。

  【架构位置】
    登录产品区 — app/features/editor barrel。

  【主要导出 / 路由】
    EditorWorkspace

  【依赖关系】
    - 依赖：./components/EditorWorkspace.vue
    - 被引用：app/pages/docs/[id].vue、WorkspaceDashboard prefetch

  【渲染 / 数据】
    无 — 页面仅导入 EditorWorkspace；其余逻辑留在 feature 内部 composables。
*/
export { default as EditorWorkspace } from './components/EditorWorkspace.vue'
