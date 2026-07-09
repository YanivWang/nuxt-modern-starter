/*
  【文件职责】
    工作台领域类型：项目实体与 CRUD payload。

  【架构位置】
    登录产品区 — app/features/workspace/types.ts。
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
