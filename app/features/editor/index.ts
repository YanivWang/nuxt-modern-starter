/*
  【文件职责】
    editor feature 对外导出面：EditorWorkspace 与文档 API adapter。

  【架构位置】
    登录产品区 — app/features/editor barrel。

  【主要导出 / 路由】
    EditorWorkspace、fetchEditorDocument、saveEditorDocument

  【依赖关系】
    - 依赖：./api.ts、./components/EditorWorkspace.vue
    - 被引用：app/pages/docs/[id].vue、WorkspaceDashboard prefetch

  【渲染 / 数据】
    无 — 纯 re-export。

  【边界与注意】
    页面须从 ~/features/editor 导入；与 workspace api 协同完成新建 / 编辑流程。
*/
export * from './api'
export { default as EditorWorkspace } from './components/EditorWorkspace.vue'
