/*
  【文件职责】
    工作台单测共享 fixture：项目 mock 数据。
*/
import type { WorkspaceProject } from '../../app/features/workspace/types'

export const workspaceProjectFixture: WorkspaceProject = {
  id: 'project_1',
  workspaceId: 'workspace_1',
  documentId: 'document_1',
  title: 'Quarterly plan',
  description: null,
  updatedAt: '2026-07-09T00:00:00.000Z',
  accent: 'violet'
}
