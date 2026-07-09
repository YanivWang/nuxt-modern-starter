/*
  【文件职责】
    编辑器单测共享 fixture：项目与文档 mock 数据。
*/
import type { EditorDocument } from '../../app/types/document'
import type { WorkspaceProject } from '../../app/features/workspace/types'

export const editorProjectFixture: WorkspaceProject = {
  id: 'project_1',
  workspaceId: 'workspace_1',
  documentId: 'document_1',
  title: 'Untitled',
  description: null,
  updatedAt: '2026-07-09T00:00:00.000Z',
  accent: 'blue'
}

export const editorDocumentFixture: EditorDocument = {
  id: 'document_1',
  projectId: 'project_1',
  title: 'Untitled',
  content: '<p></p>',
  updatedAt: '2026-07-09T00:00:00.000Z'
}
