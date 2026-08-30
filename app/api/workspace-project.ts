/*
  【文件职责】
    Workspace 项目 Product API adapter：项目 CRUD、文档 path helper、新建 id 常量。
    全部经 createProductApiClient（401 单飞 refresh）。

  【架构位置】
    共享 API 层 — app/api，供 workspace 与 editor feature 共同使用。

  【主要导出 / 路由】
    fetchWorkspaceProjects、fetchWorkspaceProject、createWorkspaceProject、
    updateWorkspaceProject、deleteWorkspaceProject、getWorkspaceDocPath、
    getWorkspaceNewDocPath、isNewWorkspaceProjectId、WORKSPACE_NEW_PROJECT_ID

  【依赖关系】
    - 依赖：app/api/auth.ts createProductApiClient、~/types/document、~/types/workspace-project
    - 被引用：workspace feature、editor feature、tests/unit/workspace-api.test.ts

  【渲染 / 数据】
    adapter 相对路径：/projects、/projects/:id（base NUXT_PUBLIC_API_BASE 已含 /api/v1）。
    /projects 为分页接口：返回 { projects, pagination }，默认单页 20 条、服务端上限 100。
    WORKSPACE_NEW_PROJECT_ID = 'new' → /docs/new。

  【边界与注意】
    createProductApiClient 定义在 app/api/auth.ts，不在 app/api/clients.ts。
    首次非空保存后 editor replace 到 /docs/:realId。
*/
import type { ApiResponse } from '~/lib/http/types'
import { createProductApiClient } from '~/api/auth'
import type { EditorDocument } from '~/types/document'
import type {
  CreateWorkspaceProjectPayload,
  UpdateWorkspaceProjectPayload,
  WorkspaceProject,
  WorkspaceProjectListQuery,
  WorkspaceProjectPagination
} from '~/types/workspace-project'

export const WORKSPACE_NEW_PROJECT_ID = 'new'

// 语言中性产品 URL；新建 id='new' → /docs/new
export const getWorkspaceDocPath = (id: string) => `/docs/${id}`

export const getWorkspaceNewDocPath = () => getWorkspaceDocPath(WORKSPACE_NEW_PROJECT_ID)

export const isNewWorkspaceProjectId = (id: string) => id === WORKSPACE_NEW_PROJECT_ID

/**
 * 项目列表为分页接口。不传 query 时服务端按默认单页 20 条返回，
 * 因此调用方必须读取 pagination 才知道是否还有后续页——直接用 projects 会静默丢数据。
 */
export const fetchWorkspaceProjects = (query: WorkspaceProjectListQuery = {}) =>
  createProductApiClient().request<
    ApiResponse<{ projects: WorkspaceProject[]; pagination: WorkspaceProjectPagination }>
  >('/projects', {
    method: 'GET',
    query
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
    ApiResponse<{ project: WorkspaceProject; document: EditorDocument }>
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
