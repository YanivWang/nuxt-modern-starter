/*
  【文件职责】
    Workspace 项目共享领域类型：项目实体与 CRUD payload，供 workspace 与 editor feature 共同使用。

  【架构位置】
    共享类型层 — app/types，不属于任一 feature。

  【主要导出 / 路由】
    WorkspaceProject、WorkspaceProjectAccent、WorkspaceProjectPagination、
    WorkspaceProjectListQuery、CreateWorkspaceProjectPayload、UpdateWorkspaceProjectPayload

  【依赖关系】
    - 依赖：app/lib/http/types.ts（ApiPagination）
    - 被引用：app/api/workspace-project.ts、workspace feature、editor feature、tests/fixtures

  【渲染 / 数据】
    无

  【边界与注意】
    仅描述项目领域数据形状，不包含请求实现或 UI 组件类型。
*/
import type { ApiPagination } from '../lib/http/types'
/** 与后端 ProjectAccent 同源；后端出库时会把越界取值归一化为 blue。 */
export type WorkspaceProjectAccent = 'blue' | 'green' | 'violet' | 'amber' | 'cyan' | 'rose'

/**
 * 与后端 ProjectDto 一一对应。
 * 后端曾返回 editPath / previewPath，但那是后端拼出的前端路径——既无人消费，
 * 又会在前端改路由后变成错误数据，现已从契约中移除；路径统一由 getWorkspaceDocPath 生成。
 */
export type WorkspaceProject = {
  id: string
  workspaceId: string
  /**
   * 关联编辑器文档 id；可能为 null（项目尚未建文档）。
   * 注意列表卡片跳的是 /docs/:projectId 而非 documentId —— 路由参数 :id 始终是项目 id，
   * documentId 由 /docs/[id].vue 拉取项目后解析（见 useEditorPage）。
   */
  documentId: string | null
  title: string
  description: string | null
  updatedAt: string
  accent: WorkspaceProjectAccent
}

/**
 * 列表分页元信息。全站共用 ApiPagination 一份定义，这里只保留一个别名：
 * 形状本身归 app/lib/http/types.ts 管，工作台和公开内容不各留一份副本。
 */
export type WorkspaceProjectPagination = ApiPagination

export type WorkspaceProjectListQuery = {
  limit?: number
  offset?: number
}

export type CreateWorkspaceProjectPayload = {
  title: string
  description?: string
}

export type UpdateWorkspaceProjectPayload = {
  title?: string
  description?: string
}
