/*
  【文件职责】
    工作台单测共享 fixture：项目 mock 数据。
*/
import type {
  WorkspaceProject,
  WorkspaceProjectPagination
} from '../../app/types/workspace-project'

export const workspaceProjectFixture: WorkspaceProject = {
  id: 'project_1',
  workspaceId: 'workspace_1',
  documentId: 'document_1',
  title: 'Quarterly plan',
  description: null,
  updatedAt: '2026-07-09T00:00:00.000Z',
  accent: 'violet'
}

export const workspaceProjectPaginationFixture: WorkspaceProjectPagination = {
  total: 42,
  limit: 20,
  offset: 0,
  hasMore: true
}

export const makeWorkspaceProject = (id: string): WorkspaceProject => ({
  ...workspaceProjectFixture,
  id
})
