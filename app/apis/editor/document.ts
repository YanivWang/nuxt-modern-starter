import type { ApiResponse } from '../../api-core/api-types'
import { createEditorApiClient } from './client'

export type EditorDocument = {
  id: string
  projectId: string
  title: string
  content: string
  updatedAt?: string
}

export type SaveEditorDocumentPayload = {
  title?: string
  content: string
}

const editorDocumentPath = (documentId: string) => `/documents/${documentId}`

export const fetchEditorDocument = (documentId: string) =>
  createEditorApiClient().request<ApiResponse<{ document: EditorDocument }>>(
    editorDocumentPath(documentId),
    {
      method: 'GET'
    }
  )

export const saveEditorDocument = (documentId: string, payload: SaveEditorDocumentPayload) =>
  createEditorApiClient().request<ApiResponse<{ document: EditorDocument }>>(
    editorDocumentPath(documentId),
    {
      method: 'PATCH',
      body: payload
    }
  )
