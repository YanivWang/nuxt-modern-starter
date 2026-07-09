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

    // 草稿尚无 documentId 且内容仍为空时不调度 timer，避免 /docs/new 空页触发创建
    if (!effectiveDocumentId.value && isBlankEditorContent(getContentHtml())) {
      return
    }

    clearAutosaveTimer()
    // debounceMs 由 useEditorWorkspace 传入 EDITOR_AUTOSAVE_DEBOUNCE_MS（2000）
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

      // 草稿模式：首次非空保存走 ensureDraftProject（创建 project + 初始 document + replace 路由）
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
      // 保存期间若用户继续输入，dirty 仍为 true，需重新调度 autosave
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

    // onBeforeRouteLeave 调用：取消 pending timer 并同步落盘
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
