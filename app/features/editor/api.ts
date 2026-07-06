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
