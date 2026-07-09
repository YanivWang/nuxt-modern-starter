/*
  【文件职责】
    编辑器文档加载与初始内容同步：按 effectiveDocumentId 拉取文档、初始化 editor HTML、同步 lastSavedAt。

  【架构位置】
    登录产品区 — app/features/editor/composables，被 useEditorWorkspace 消费。
*/
import { ref, watch, type Ref } from 'vue'
import { fetchEditorDocument } from '../api'
import type { EditorDocument } from '~/types/document'

const EMPTY_EDITOR_HTML = '<p></p>'

const syncLastSavedAt = (
  document: EditorDocument | null | undefined,
  lastSavedAt: Ref<number | null>
) => {
  if (!document?.updatedAt) {
    return
  }

  const updatedAt = new Date(document.updatedAt).getTime()
  if (!Number.isNaN(updatedAt)) {
    lastSavedAt.value = updatedAt
  }
}

export const useEditorDocument = (effectiveDocumentId: Ref<string | null>) => {
  const editorInitialContent = ref(EMPTY_EDITOR_HTML)
  const lastSavedAt = ref<number | null>(null)

  const { data: document, pending } = useAsyncData(
    () =>
      effectiveDocumentId.value
        ? `editor-document:${effectiveDocumentId.value}`
        : 'editor-document:new',
    async () => {
      if (!effectiveDocumentId.value) {
        return null
      }

      const response = await fetchEditorDocument(effectiveDocumentId.value)
      return response.data.document
    },
    { watch: [effectiveDocumentId] }
  )

  const bindDocumentToEditor = (editorReady: Ref<boolean>) => {
    watch(
      document,
      (nextDocument) => {
        if (editorReady.value) {
          syncLastSavedAt(nextDocument, lastSavedAt)
          return
        }

        editorInitialContent.value = nextDocument?.content?.trim() || EMPTY_EDITOR_HTML
        syncLastSavedAt(nextDocument, lastSavedAt)
      },
      { immediate: true }
    )
  }

  return {
    document,
    pending,
    editorInitialContent,
    lastSavedAt,
    bindDocumentToEditor
  }
}
