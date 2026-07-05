import type { ApiResponse } from '../../api-core/api-types'
import { createProductApiClient } from '../../apis/product/client'

export type WorkspaceProjectStatus = 'draft' | 'ready' | 'shared'
export type WorkspaceProjectAccent = 'blue' | 'green' | 'violet' | 'amber' | 'cyan' | 'rose'

export type WorkspaceProject = {
  id: string
  workspaceId: string
  documentId: string | null
  title: string
  description: string | null
  updatedAt: string
  slideCount: number
  status: WorkspaceProjectStatus
  accent: WorkspaceProjectAccent
  editPath: string
  previewPath: string
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
