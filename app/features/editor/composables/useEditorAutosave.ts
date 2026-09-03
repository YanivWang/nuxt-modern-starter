/*
  【文件职责】
    编辑器自动保存状态机：dirty baseline、debounce、草稿创建、文档保存、flush、timer 清理。

  【架构位置】
    登录产品区 — app/features/editor/composables，被 useEditorWorkspace 消费。

  【主要导出 / 路由】
    useEditorAutosave、UseEditorAutosaveOptions

  【依赖关系】
    - 依赖：editor-content.ts、saveEditorDocument、useDraftProject.ensureDraftProject
    - 被引用：useEditorWorkspace.ts、tests/unit/editor-autosave.test.ts

  【渲染 / 数据】
    CSR；保存 HTML content + title，lastSavedAt 只作为 UI 提示时间，不作为后端版本控制。

  【边界与注意】
    空 /docs/new 不创建项目；首次非空保存先 ensureDraftProject。
    保存期间继续输入会让 dirty 保持 true，并在保存完成后重新调度 autosave。
    实现要点：dirty baseline 始终等于「服务端上存着的那份内容」。
    落盘后把 baseline 设成当前编辑器内容，会把落盘期间新敲的部分当作已保存而永久丢掉。
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
  ensureDraftProject: (contentToSave: string) => Promise<string | null>
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
      // 先定下这一轮要存的内容，两条分支都以它为准做事后的脏比对
      const contentToSave = getContentHtml()
      const documentId = effectiveDocumentId.value

      if (documentId) {
        const response = await saveDocument(documentId, {
          title: getTitle(),
          content: contentToSave
        })
        document.value = response.data.document
      } else {
        // 草稿模式：首次非空保存走 ensureDraftProject（创建 project + 初始 document + replace 路由）
        // 它内部会把 contentToSave 写进新文档，所以这里不再重复保存一次
        const draftId = await ensureDraftProject(contentToSave)

        if (!draftId) {
          return
        }
      }

      lastSavedAt.value = Date.now()

      // baseline 记的必须是「服务端上现在存着的那份」，而不是「此刻编辑器里的那份」。
      //
      // 落盘要好几个来回（草稿分支还要建项目、换路由），用户完全来得及继续敲。
      // 把 baseline 设成当前内容，等于宣布这段新内容已经保存过了：
      // 随后 markDirty() 拿当前内容和它自己比，永远相等，scheduleAutosave() 于是
      // 立刻把 dirty 抹回 false 并直接返回 —— 那段内容再也不会被写出去，
      // 离开页面时 flushAutosave() 看到的也是 dirty=false。
      initialSnapshot.value = contentToSave
      markDirty()

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
