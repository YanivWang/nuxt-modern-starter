/*
  【文件职责】
    workspace feature 对外导出面：WorkspaceDashboard 与 api 类型 / 函数。
    页面须从 ~/features/workspace 导入，勿深引 components 或 api 路径。

  【架构位置】
    登录产品区 — app/features/workspace barrel。

  【主要导出 / 路由】
    WorkspaceDashboard、fetchWorkspaceProjects、WORKSPACE_NEW_PROJECT_ID 等

  【依赖关系】
    - 依赖：./components/WorkspaceDashboard.vue、./api.ts
    - 被引用：app/pages/workspace/index.vue、app/pages/docs/[id].vue

  【渲染 / 数据】
    无 — 纯 re-export。

  【边界与注意】
    WORKSPACE_NEW_PROJECT_ID = 'new' 对应 /docs/new，与 editor 首次保存流程耦合。
*/
// 跨 feature 导入入口；勿深引 ./api 或 components 路径
export { default as WorkspaceDashboard } from './components/WorkspaceDashboard.vue'
export * from './types'
export * from './api'
