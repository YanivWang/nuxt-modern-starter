/*
  【文件职责】
    编辑器工作区编排：串联文档加载、标题、草稿创建、自动保存与路由离开 flush。

  【架构位置】
    登录产品区 — app/features/editor/composables，被 EditorWorkspace 消费。
*/
import { message } from 'ant-design-vue'
import { computed, ref, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { YanivEditor } from '@yanivjs/yaniv-editor'
import {
  createWorkspaceProject,
  getWorkspaceDocPath,
  updateWorkspaceProject,
  type WorkspaceProject
} from '~/features/workspace'
import { saveEditorDocument } from '../api'
import { EDITOR_AUTOSAVE_DEBOUNCE_MS, type EditorProjectContext } from '../types'
import { useDraftProject } from './useDraftProject'
import { useEditorAutosave } from './useEditorAutosave'
import { useEditorDocument } from './useEditorDocument'
import { useEditorTitle } from './useEditorTitle'

export type UseEditorWorkspaceOptions = {
  documentId: Ref<string | null | undefined>
  project: Ref<EditorProjectContext | null | undefined>
  onProjectCreated: (project: WorkspaceProject) => void
  onProjectUpdated: (project: Pick<WorkspaceProject, 'id' | 'title'>) => void
}

export const useEditorWorkspace = ({
  documentId,
  project,
  onProjectCreated,
  onProjectUpdated
}: UseEditorWorkspaceOptions) => {
  const { t } = useI18n()
  const { localePath } = useLocalePath()
  const router = useRouter()

  const editorRef = ref<InstanceType<typeof YanivEditor> | null>(null)
  const draftDocumentId = ref<string | null>(null)

  const effectiveDocumentId = computed(() => documentId.value ?? draftDocumentId.value)

  const { document, pending, editorInitialContent, lastSavedAt, bindDocumentToEditor } =
    useEditorDocument(effectiveDocumentId)

  const defaultTitleText = computed(() => t('workspace.defaultTitle'))
  const getEditorContentHtml = () => editorRef.value?.getHTML()?.trim() ?? ''

  const {
    localTitle,
    editableTitle,
    isEditingTitle,
    titleSaving,
    startTitleEdit,
    commitTitleEdit,
    cancelTitleEdit,
    onTitleKeydown
  } = useEditorTitle({
    project,
    document,
    defaultTitleText,
    effectiveDocumentId,
    lastSavedAt,
    getContentHtml: getEditorContentHtml,
    saveDocument: saveEditorDocument,
    updateProject: updateWorkspaceProject,
    onProjectUpdated,
    notifyError: () => message.error(t('editor.rename.failed'))
  })

  const getTitle = () => localTitle.value || defaultTitleText.value

  const { isDraftMode, ensureDraftProject } = useDraftProject({
    effectiveDocumentId,
    draftDocumentId,
    document,
    getContentHtml: getEditorContentHtml,
    getTitle,
    createProject: createWorkspaceProject,
    saveDocument: saveEditorDocument,
    navigateToProject: (projectId) => router.replace(localePath(getWorkspaceDocPath(projectId))),
    onProjectCreated
  })

  const {
    editorReady,
    saving,
    saveFailed,
    showAutosave,
    autosaveHintText,
    markEditorReady,
    resetDirtyBaseline,
    scheduleAutosave,
    flushAutosave,
    clearAutosaveTimer
  } = useEditorAutosave({
    effectiveDocumentId,
    isDraftMode,
    document,
    lastSavedAt,
    getContentHtml: getEditorContentHtml,
    getTitle,
    ensureDraftProject,
    saveDocument: saveEditorDocument,
    notifyError: () => message.error(t('editor.autosave.failed')),
    formatSaving: () => t('editor.autosave.saving'),
    formatFailed: () => t('editor.autosave.failed'),
    formatSaved: (time) => t('editor.autosave.saved', { time }),
    debounceMs: EDITOR_AUTOSAVE_DEBOUNCE_MS
  })

  bindDocumentToEditor(editorReady)

  const onEditorUpdate = () => {
    scheduleAutosave()
  }

  const bindEditorLifecycle = () => {
    watch(editorRef, async (editor) => {
      if (editor == null || pending.value) {
        return
      }

      await nextTick()
      markEditorReady()
      resetDirtyBaseline()
    })

    onBeforeUnmount(() => {
      clearAutosaveTimer()
    })

    onBeforeRouteLeave(async () => {
      if (saving.value) {
        return true
      }

      await flushAutosave()
      return true
    })
  }

  return {
    editorRef,
    editorInitialContent,
    pending,
    editorReady,
    localTitle,
    editableTitle,
    isEditingTitle,
    titleSaving,
    autosaveHintText,
    saving,
    saveFailed,
    showAutosave,
    startTitleEdit,
    commitTitleEdit,
    cancelTitleEdit,
    onTitleKeydown,
    onEditorUpdate,
    bindEditorLifecycle
  }
}
