/*
  【文件职责】
    工作台 Product API adapter：项目 CRUD、文档 path helper、新建 id 常量。
    全部经 createProductApiClient（401 单飞 refresh）。

  【架构位置】
    登录产品区 — app/features/workspace api，被 dashboard、editor 页消费。

  【主要导出 / 路由】
    fetchWorkspaceProjects、fetchWorkspaceProject、createWorkspaceProject、
    updateWorkspaceProject、deleteWorkspaceProject、getWorkspaceDocPath、WORKSPACE_NEW_PROJECT_ID

  【依赖关系】
    - 依赖：app/api/auth.ts createProductApiClient
    - 被引用：WorkspaceDashboard、docs/[id].vue、EditorWorkspace、tests/unit/workspace-api.test.ts

  【渲染 / 数据】
    adapter 相对路径：/projects、/projects/:id（base NUXT_PUBLIC_API_BASE 已含 /api）。
    WORKSPACE_NEW_PROJECT_ID = 'new' → /docs/new。

  【边界与注意】
    createProductApiClient 定义在 app/api/auth.ts，不在 app/api/clients.ts。
    首次非空保存后 editor replace 到 /docs/:realId。
*/
import type { ApiResponse } from '~/lib/http/types'
import { createProductApiClient } from '~/api/auth'

export type WorkspaceProjectAccent = 'blue' | 'green' | 'violet' | 'amber' | 'cyan' | 'rose'

export type WorkspaceProject = {
  id: string
  workspaceId: string
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

export type WorkspaceDocument = {
  id: string
  projectId: string
  title: string
  content: string
  updatedAt: string
}

export const WORKSPACE_NEW_PROJECT_ID = 'new'

export const getWorkspaceDocPath = (id: string) => `/docs/${id}`

export const getWorkspaceNewDocPath = () => getWorkspaceDocPath(WORKSPACE_NEW_PROJECT_ID)

export const isNewWorkspaceProjectId = (id: string) => id === WORKSPACE_NEW_PROJECT_ID

export const fetchWorkspaceProjects = () =>
  createProductApiClient().request<ApiResponse<{ projects: WorkspaceProject[] }>>('/projects', {
    method: 'GET'
  })

export const fetchWorkspaceProject = (projectId: string) =>
  createProductApiClient().request<ApiResponse<{ project: WorkspaceProject }>>(
    `/projects/${projectId}`,
    {
      method: 'GET'
    }
  )

export const createWorkspaceProject = (payload: CreateWorkspaceProjectPayload) =>
  createProductApiClient().request<
    ApiResponse<{ project: WorkspaceProject; document: WorkspaceDocument }>
  >('/projects', {
    method: 'POST',
    body: payload
  })

export const updateWorkspaceProject = (projectId: string, payload: UpdateWorkspaceProjectPayload) =>
  createProductApiClient().request<ApiResponse<{ project: WorkspaceProject }>>(
    `/projects/${projectId}`,
    {
      method: 'PATCH',
      body: payload
    }
  )

export const deleteWorkspaceProject = (projectId: string) =>
  createProductApiClient().request<ApiResponse<null>>(`/projects/${projectId}`, {
    method: 'DELETE'
  })
