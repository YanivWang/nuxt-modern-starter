/*
  【文件职责】
    Workspace 项目共享领域类型：项目实体与 CRUD payload，供 workspace 与 editor feature 共同使用。

  【架构位置】
    共享类型层 — app/types，不属于任一 feature。

  【主要导出 / 路由】
    WorkspaceProject、CreateWorkspaceProjectPayload、UpdateWorkspaceProjectPayload

  【依赖关系】
    - 依赖：无
    - 被引用：app/api/workspace-project.ts、workspace feature、editor feature、tests/fixtures

  【渲染 / 数据】
    无

  【边界与注意】
    仅描述项目领域数据形状，不包含请求实现或 UI 组件类型。
*/
export type WorkspaceProjectAccent = 'blue' | 'green' | 'violet' | 'amber' | 'cyan' | 'rose'

export type WorkspaceProject = {
  id: string
  workspaceId: string
  /** 关联编辑器文档 id；列表卡片跳转 /docs/:documentId */
  documentId: string | null
  title: string
  description: string | null
  updatedAt: string
  accent: WorkspaceProjectAccent
}

export type CreateWorkspaceProjectPayload = {
  title: string
  description?: string
}

export type UpdateWorkspaceProjectPayload = {
  title?: string
  description?: string
}
