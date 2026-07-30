<!--
  【文件职责】
    全屏编辑器容器：异步加载 YanivEditor，并由 useEditorWorkspace 编排。

  【架构位置】
    登录产品区 — app/features/editor，由 app/pages/docs/[id].vue 挂载（editor layout）。

  【主要导出 / 路由】
    EditorWorkspace；emit project-created / project-updated

  【依赖关系】
    - 依赖：useEditorWorkspace、useEditorMediaUpload、EditorWorkspaceHeader、@yanivjs/yaniv-editor（异步组件）
    - 被引用：app/pages/docs/[id].vue

  【渲染 / 数据】
    CSR；业务逻辑见 composables/useEditorWorkspace.ts；图片/视频上传见 useEditorMediaUpload。
-->
<script setup lang="ts">
import '@yanivjs/yaniv-editor/style.css'
import { defineAsyncComponent } from 'vue'
import type { WorkspaceProject } from '~/types/workspace-project'
import { EDITOR_Z_INDEX_BASE, editorCustomAppearanceVars } from '../editor-appearance'
import { useEditorMediaUpload } from '../composables/useEditorMediaUpload'
import { useEditorWorkspace } from '../composables/useEditorWorkspace'
import type { EditorProjectContext } from '../types'
import EditorWorkspaceHeader from './EditorWorkspaceHeader.vue'

const YanivEditor = defineAsyncComponent(() =>
  import('@yanivjs/yaniv-editor').then((module) => module.YanivEditor)
)

const props = defineProps<{
  documentId?: string | null
  project?: EditorProjectContext | null
}>()

const emit = defineEmits<{
  'project-created': [project: WorkspaceProject]
  'project-updated': [project: Pick<WorkspaceProject, 'id' | 'title'>]
}>()

const { resolvedMode } = useTheme()
const languageStore = useLanguageStore()

const {
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
} = useEditorWorkspace({
  documentId: computed(() => props.documentId),
  project: computed(() => props.project),
  onProjectCreated: (project) => emit('project-created', project),
  onProjectUpdated: (project) => emit('project-updated', project)
})

bindEditorLifecycle()

const { handleUploadImage, handleUploadVideo } = useEditorMediaUpload()

// YanivEditor 固定 edit/full/custom；appearance 映射 --app-* → --ye-*
const EDITOR_MODE = 'edit' as const
const EDITOR_PRESET = 'full' as const
const EDITOR_APPEARANCE = 'custom' as const
</script>

<template>
  <div class="editor-workspace">
    <EditorWorkspaceHeader
      :local-title="localTitle"
      :editable-title="editableTitle"
      :is-editing-title="isEditingTitle"
      :title-saving="titleSaving"
      :autosave-hint-text="autosaveHintText"
      :saving="saving"
      :save-failed="saveFailed"
      :show-autosave="showAutosave"
      @start-title-edit="startTitleEdit"
      @commit-title-edit="commitTitleEdit"
      @cancel-title-edit="cancelTitleEdit"
      @title-keydown="onTitleKeydown"
      @update:editable-title="editableTitle = $event"
    />

    <main class="editor-workspace__body">
      <div class="editor-workspace__surface">
        <div v-if="pending && !editorReady" class="editor-workspace__loading">
          <a-spin />
        </div>
        <YanivEditor
          v-if="!pending || editorReady"
          ref="editorRef"
          :mode="EDITOR_MODE"
          :preset="EDITOR_PRESET"
          :appearance="EDITOR_APPEARANCE"
          :custom-appearance-vars="editorCustomAppearanceVars"
          :z-index-base="EDITOR_Z_INDEX_BASE"
          :color-mode="resolvedMode"
          :locale="languageStore.currentLanguage"
          :initial-content="editorInitialContent"
          :upload-image="handleUploadImage"
          :upload-video="handleUploadVideo"
          @update="onEditorUpdate"
        />
      </div>
    </main>
  </div>
</template>
