/*
  【文件职责】
    编辑器自动保存状态机：dirty baseline、debounce、草稿创建、文档保存、flush、timer 清理。

  【架构位置】
    登录产品区 — app/features/editor/composables，被 useEditorWorkspace 消费。
*/
import { computed, ref, type Ref } from 'vue'
import { isBlankEditorContent, formatEditorSavedAt } from './editor-content'
import type { SaveEditorDocumentPayload } from '../api'
import type { EditorDocument } from '~/types/document'

type SaveDocumentResponse = Promise<{ data: { document: EditorDocument } }>

export type UseEditorAutosaveOptions = {
  effectiveDocumentId: Ref<string | null>
  isDraftMode: Ref<boolean>
  document: Ref<EditorDocument | null | undefined>
  lastSavedAt: Ref<number | null>
  getContentHtml: () => string
  getTitle: () => string
  ensureDraftProject: () => Promise<string | null>
  saveDocument: (documentId: string, payload: SaveEditorDocumentPayload) => SaveDocumentResponse
  notifyError: () => void
  formatSaving: () => string
  formatFailed: () => string
  formatSaved: (time: string) => string
  debounceMs: number
}

export const useEditorAutosave = ({
  effectiveDocumentId,
  isDraftMode,
  document,
  lastSavedAt,
  getContentHtml,
  getTitle,
  ensureDraftProject,
  saveDocument,
  notifyError,
  formatSaving,
  formatFailed,
  formatSaved,
  debounceMs
}: UseEditorAutosaveOptions) => {
  const editorReady = ref(false)
  const saving = ref(false)
  const saveFailed = ref(false)
  const dirty = ref(false)
  const initialSnapshot = ref('')
  let autosaveTimer: ReturnType<typeof setTimeout> | null = null

  const clearAutosaveTimer = () => {
    if (autosaveTimer != null) {
      clearTimeout(autosaveTimer)
      autosaveTimer = null
    }
  }

  const takeSnapshot = () => getContentHtml()

  const resetDirtyBaseline = () => {
    initialSnapshot.value = takeSnapshot()
    dirty.value = false
  }

  const markEditorReady = () => {
    editorReady.value = true
  }

  const markDirty = () => {
    if (!editorReady.value) {
      return
    }

    dirty.value = takeSnapshot() !== initialSnapshot.value
  }

  const scheduleAutosave = () => {
    markDirty()

    if (!dirty.value) {
      return
    }

    if (!effectiveDocumentId.value && isBlankEditorContent(getContentHtml())) {
      return
    }

    clearAutosaveTimer()
    autosaveTimer = setTimeout(() => {
      autosaveTimer = null
      void persistDocument()
    }, debounceMs)
  }

  const persistDocument = async () => {
    markDirty()

    if (saving.value || !dirty.value) {
      return
    }

    saving.value = true
    saveFailed.value = false

    try {
      let documentId = effectiveDocumentId.value

      if (!documentId) {
        documentId = await ensureDraftProject()
        if (!documentId) {
          return
        }

        lastSavedAt.value = Date.now()
        resetDirtyBaseline()
        return
      }

      const contentToSave = getContentHtml()
      const response = await saveDocument(documentId, {
        title: getTitle(),
        content: contentToSave
      })
      document.value = response.data.document
      lastSavedAt.value = Date.now()

      const currentContent = getContentHtml()
      initialSnapshot.value = currentContent
      dirty.value = currentContent !== contentToSave

      if (dirty.value) {
        scheduleAutosave()
      }
    } catch {
      saveFailed.value = true
      notifyError()
    } finally {
      saving.value = false
    }
  }

  const flushAutosave = async () => {
    clearAutosaveTimer()

    if (dirty.value) {
      await persistDocument()
    }
  }

  const showAutosave = computed(() => Boolean(effectiveDocumentId.value || !isDraftMode.value))

  const autosaveHintText = computed(() => {
    if (saving.value) {
      return formatSaving()
    }

    if (saveFailed.value) {
      return formatFailed()
    }

    if (lastSavedAt.value == null) {
      return ''
    }

    return formatSaved(formatEditorSavedAt(lastSavedAt.value))
  })

  return {
    editorReady,
    saving,
    saveFailed,
    dirty,
    showAutosave,
    autosaveHintText,
    markEditorReady,
    resetDirtyBaseline,
    markDirty,
    scheduleAutosave,
    persistDocument,
    flushAutosave,
    clearAutosaveTimer
  }
}
