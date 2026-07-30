/*
  【文件职责】
    workspace feature 对外导出面：WorkspaceDashboard。
    页面须从 ~/features/workspace 导入 UI，不得深引 components 路径。

  【架构位置】
    登录产品区 — app/features/workspace barrel。

  【主要导出 / 路由】
    WorkspaceDashboard

  【依赖关系】
    - 依赖：./components/WorkspaceDashboard.vue
    - 被引用：app/pages/workspace/index.vue、app/pages/docs/[id].vue

  【渲染 / 数据】
    无 — 纯 re-export。

  【边界与注意】
    Workspace 项目 API 与类型属于 app/api/workspace-project.ts、app/types/workspace-project.ts 共享层。
*/
// Workspace feature 只暴露 UI；跨 feature 项目 API 已上移到 ~/api/workspace-project。
export { default as WorkspaceDashboard } from './components/WorkspaceDashboard.vue'
