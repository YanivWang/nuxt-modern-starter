import type { ApiResponse } from '../../api-core/api-types'
import { createProductApiClient } from '../../apis/product/client'

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

export type WorkspaceDocument = {
  id: string
  projectId: string
  title: string
  content: string
  updatedAt: string
}

export const WORKSPACE_NEW_PROJECT_ID = 'new'

export const getWorkspaceDocPath = (id: string) => `/app/docs/${id}`

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

export const deleteWorkspaceProject = (projectId: string) =>
  createProductApiClient().request<ApiResponse<null>>(`/projects/${projectId}`, {
    method: 'DELETE'
  })
