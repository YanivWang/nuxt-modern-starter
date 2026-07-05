import { createEditorApiClient } from './client'

export type EditorDocument = {
  id: string
  title: string
  content: string
  updatedAt?: string
}

export type SaveEditorDocumentPayload = {
  title?: string
  content: string
}

const editorDocumentPath = (documentId: string) => `/editor/documents/${documentId}`

export const fetchEditorDocument = (documentId: string) =>
  createEditorApiClient().request<EditorDocument>(editorDocumentPath(documentId), {
    method: 'GET'
  })

export const saveEditorDocument = (documentId: string, payload: SaveEditorDocumentPayload) =>
  createEditorApiClient().request<EditorDocument>(editorDocumentPath(documentId), {
    method: 'PATCH',
    body: payload
  })
