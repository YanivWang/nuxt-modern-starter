/*
  【文件职责】
    编辑器标题状态与持久化：本地标题、编辑态、document/project 双写、失败回滚。

  【架构位置】
    登录产品区 — app/features/editor/composables，被 useEditorWorkspace 消费。
*/
import { ref, watch, type Ref } from 'vue'
import type { WorkspaceProject } from '~/features/workspace'
import type { SaveEditorDocumentPayload } from '../api'
import type { EditorProjectContext } from '../types'
import type { EditorDocument } from '~/types/document'

type SaveDocumentResponse = Promise<{ data: { document: EditorDocument } }>
type UpdateProjectResponse = Promise<{ data: { project: Pick<WorkspaceProject, 'id' | 'title'> } }>

export type UseEditorTitleOptions = {
  project: Ref<EditorProjectContext | null | undefined>
  document: Ref<EditorDocument | null | undefined>
  defaultTitleText: Ref<string>
  effectiveDocumentId: Ref<string | null>
  lastSavedAt: Ref<number | null>
  getContentHtml: () => string
  saveDocument: (documentId: string, payload: SaveEditorDocumentPayload) => SaveDocumentResponse
  updateProject: (
    projectId: string,
    payload: Pick<WorkspaceProject, 'title'>
  ) => UpdateProjectResponse
  onProjectUpdated: (project: Pick<WorkspaceProject, 'id' | 'title'>) => void
  notifyError: () => void
}

export const useEditorTitle = ({
  project,
  document,
  defaultTitleText,
  effectiveDocumentId,
  lastSavedAt,
  getContentHtml,
  saveDocument,
  updateProject,
  onProjectUpdated,
  notifyError
}: UseEditorTitleOptions) => {
  const localTitle = ref('')
  const editableTitle = ref('')
  const isEditingTitle = ref(false)
  const titleSaving = ref(false)

  const syncLocalTitle = () => {
    localTitle.value = project.value?.title ?? document.value?.title ?? defaultTitleText.value
  }

  watch(
    [() => project.value?.title, () => document.value?.title],
    () => {
      // 编辑/保存标题期间不覆盖用户输入
      if (isEditingTitle.value || titleSaving.value) {
        return
      }

      syncLocalTitle()
    },
    { immediate: true }
  )

  const startTitleEdit = () => {
    editableTitle.value = localTitle.value
    isEditingTitle.value = true
  }

  const persistTitle = async (nextTitle: string) => {
    const trimmed = nextTitle.trim() || defaultTitleText.value

    if (trimmed === localTitle.value) {
      return
    }

    const previousTitle = localTitle.value
    localTitle.value = trimmed
    titleSaving.value = true

    try {
      const documentId = effectiveDocumentId.value

      if (documentId) {
        const response = await saveDocument(documentId, {
          title: trimmed,
          content: getContentHtml() || document.value?.content || '<p></p>'
        })
        document.value = response.data.document
        lastSavedAt.value = Date.now()
      }

      // 同步更新 workspace project 标题，保持侧栏/列表与文档一致
      if (project.value?.id) {
        const response = await updateProject(project.value.id, { title: trimmed })
        onProjectUpdated({
          id: response.data.project.id,
          title: response.data.project.title
        })
      }
    } catch {
      localTitle.value = previousTitle
      notifyError()
    } finally {
      titleSaving.value = false
    }
  }

  const commitTitleEdit = async () => {
    if (!isEditingTitle.value) {
      return
    }

    isEditingTitle.value = false
    await persistTitle(editableTitle.value)
  }

  const cancelTitleEdit = () => {
    isEditingTitle.value = false
    editableTitle.value = localTitle.value
  }

  const onTitleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      void commitTitleEdit()
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      cancelTitleEdit()
    }
  }

  return {
    localTitle,
    editableTitle,
    isEditingTitle,
    titleSaving,
    startTitleEdit,
    commitTitleEdit,
    cancelTitleEdit,
    onTitleKeydown
  }
}
