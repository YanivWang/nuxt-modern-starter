/*
  【文件职责】
    编辑器 Product API adapter：按 documentId 读取与 PATCH 保存文档内容 / 标题。
    文档与 workspace project 通过 project.documentId 关联。

  【架构位置】
    登录产品区 — app/features/editor api，被 EditorWorkspace 消费。

  【主要导出 / 路由】
    fetchEditorDocument、saveEditorDocument、EditorDocument、SaveEditorDocumentPayload

  【依赖关系】
    - 依赖：app/api/auth.ts createProductApiClient、~/features/workspace WorkspaceDocument 类型
    - 被引用：EditorWorkspace、tests/unit/editor-api.test.ts

  【渲染 / 数据】
    adapter 相对路径：/documents/:id（base 已含 /api）；401 单飞 refresh。

  【边界与注意】
    新建 flow 先 createWorkspaceProject 得 documentId，再 saveEditorDocument 写入初始内容。
*/
import type { ApiResponse } from '~/lib/http/types'
import { createProductApiClient } from '~/api/auth'
import type { WorkspaceDocument } from '~/features/workspace'

export type EditorDocument = WorkspaceDocument

export type SaveEditorDocumentPayload = {
  title?: string
  content: string
}

const editorDocumentPath = (documentId: string) => `/documents/${documentId}`

export const fetchEditorDocument = (documentId: string) =>
  createProductApiClient().request<ApiResponse<{ document: EditorDocument }>>(
    editorDocumentPath(documentId),
    {
      method: 'GET'
    }
  )

export const saveEditorDocument = (documentId: string, payload: SaveEditorDocumentPayload) =>
  createProductApiClient().request<ApiResponse<{ document: EditorDocument }>>(
    editorDocumentPath(documentId),
    {
      method: 'PATCH',
      body: payload
    }
  )
