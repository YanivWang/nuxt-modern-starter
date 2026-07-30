/*
  【文件职责】
    编辑器工作区编排：串联文档加载、标题、草稿创建、自动保存与路由离开 flush。

  【架构位置】
    登录产品区 — app/features/editor/composables，被 EditorWorkspace 消费。

  【主要导出 / 路由】
    useEditorWorkspace、UseEditorWorkspaceOptions

  【依赖关系】
    - 依赖：useEditorDocument、useEditorTitle、useDraftProject、useEditorAutosave、workspace api
    - 被引用：EditorWorkspace.vue

  【渲染 / 数据】
    CSR 编辑器会话；documentId 可能来自路由，也可能由 /docs/new 首次保存后产生。

  【边界与注意】
    editorRef 暴露的是第三方 YanivEditor 实例，只依赖 getHTML 这个最小契约。
    路由离开前会 flush autosave；若正在 saving，保持放行，避免阻塞导航。
*/
import { message } from 'ant-design-vue'
import { computed, ref, type ComponentPublicInstance, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  createWorkspaceProject,
  getWorkspaceDocPath,
  updateWorkspaceProject
} from '~/api/workspace-project'
import type { WorkspaceProject } from '~/types/workspace-project'
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

type EditorInstance = ComponentPublicInstance & {
  // YanivEditor 未在本项目声明完整实例类型；这里只绑定 autosave 需要的最小方法。
  getHTML?: () => string
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

  const editorRef = ref<EditorInstance | null>(null)
  const draftDocumentId = ref<string | null>(null)

  const effectiveDocumentId = computed(() => documentId.value ?? draftDocumentId.value)

  const { document, pending, editorInitialContent, lastSavedAt, bindDocumentToEditor } =
    useEditorDocument(effectiveDocumentId)

  const defaultTitleText = computed(() => t('workspace.defaultTitle'))
  const getEditorContentHtml = () => editorRef.value?.getHTML?.()?.trim() ?? ''

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

    // 路由离开前同步落盘：取消 debounce timer 并 flush dirty（见 useEditorAutosave.flushAutosave）
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
