<script setup lang="ts">
import { message } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'
import { YanivEditor } from '@yanivjs/yaniv-editor'
import '@yanivjs/yaniv-editor/style.css'
import { fetchEditorDocument, saveEditorDocument } from '../../../apis/editor'
import {
  createWorkspaceProject,
  getWorkspaceDocPath,
  updateWorkspaceProject,
  type WorkspaceProject
} from '../../workspace/api'
import EditorWorkspaceHeader from './EditorWorkspaceHeader.vue'

type EditorProjectContext = Pick<WorkspaceProject, 'id' | 'title'>

const props = defineProps<{
  documentId?: string | null
  project?: EditorProjectContext | null
}>()

const emit = defineEmits<{
  'project-created': [project: WorkspaceProject]
  'project-updated': [project: Pick<WorkspaceProject, 'id' | 'title'>]
}>()

const AUTOSAVE_DEBOUNCE_MS = 2000

const { t } = useI18n()
const languageStore = useLanguageStore()
const { localePath } = useLocalePath()
const router = useRouter()
const editorRef = ref<InstanceType<typeof YanivEditor> | null>(null)
const editorInitialContent = ref('<p></p>')
const editorReady = ref(false)
const saving = ref(false)
const saveFailed = ref(false)
const dirty = ref(false)
const lastSavedAt = ref<number | null>(null)
const initialSnapshot = ref('')
const draftDocumentId = ref<string | null>(null)
const localTitle = ref('')
const isEditingTitle = ref(false)
const editableTitle = ref('')
const titleInputRef = ref<HTMLInputElement | null>(null)
const headerRef = ref<InstanceType<typeof EditorWorkspaceHeader> | null>(null)
const titleSaving = ref(false)

const EDITOR_MODE = 'edit' as const
const EDITOR_PRESET = 'full' as const

let autosaveTimer: ReturnType<typeof setTimeout> | null = null

const effectiveDocumentId = computed(() => props.documentId ?? draftDocumentId.value)
const isDraftMode = computed(() => !props.documentId && !draftDocumentId.value)

const isBlankEditorContent = (html: string) => {
  const normalized = html
    .replace(/<br\s*\/?>/gi, '')
    .replace(/<\/?p[^>]*>/gi, '')
    .replace(/&nbsp;/gi, '')
    .trim()

  return normalized.length === 0
}

const { data: document, pending } = await useAsyncData(
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

watch(
  document,
  (nextDocument) => {
    if (editorReady.value) {
      if (nextDocument?.updatedAt) {
        const updatedAt = new Date(nextDocument.updatedAt).getTime()
        if (!Number.isNaN(updatedAt)) {
          lastSavedAt.value = updatedAt
        }
      }
      return
    }

    editorInitialContent.value = nextDocument?.content?.trim() || '<p></p>'

    if (nextDocument?.updatedAt) {
      const updatedAt = new Date(nextDocument.updatedAt).getTime()
      if (!Number.isNaN(updatedAt)) {
        lastSavedAt.value = updatedAt
      }
    }
  },
  { immediate: true }
)

const defaultTitleText = computed(() => t('workspace.defaultTitle'))

const syncLocalTitle = () => {
  localTitle.value = props.project?.title ?? document.value?.title ?? defaultTitleText.value
}

watch(
  [() => props.project?.title, () => document.value?.title],
  () => {
    if (isEditingTitle.value) {
      return
    }

    syncLocalTitle()
  },
  { immediate: true }
)

const startTitleEdit = async () => {
  editableTitle.value = localTitle.value
  isEditingTitle.value = true

  await nextTick()
  titleInputRef.value = headerRef.value?.titleInputRef ?? null
  titleInputRef.value?.focus()
  titleInputRef.value?.select()
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
      const response = await saveEditorDocument(documentId, {
        title: trimmed,
        content: getEditorContentHtml() || document.value?.content || '<p></p>'
      })
      document.value = response.data.document
      lastSavedAt.value = Date.now()
    }

    if (props.project?.id) {
      try {
        const response = await updateWorkspaceProject(props.project.id, { title: trimmed })
        emit('project-updated', {
          id: response.data.project.id,
          title: response.data.project.title
        })
      } catch {
        emit('project-updated', {
          id: props.project.id,
          title: trimmed
        })
      }
    }
  } catch {
    localTitle.value = previousTitle
    message.error(t('editor.rename.failed'))
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

const autosaveHintText = computed(() => {
  if (saving.value) {
    return t('editor.autosave.saving')
  }

  if (saveFailed.value) {
    return t('editor.autosave.failed')
  }

  if (lastSavedAt.value == null) {
    return ''
  }

  return t('editor.autosave.saved', {
    time: formatSavedAt(lastSavedAt.value)
  })
})

const formatSavedAt = (timestamp: number) => {
  const date = new Date(timestamp)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const getEditorContentHtml = () => editorRef.value?.getHTML()?.trim() ?? ''

const takeSnapshot = () => getEditorContentHtml()

const resetDirtyBaseline = () => {
  initialSnapshot.value = takeSnapshot()
  dirty.value = false
}

const markDirty = () => {
  if (!editorReady.value) {
    return
  }

  dirty.value = takeSnapshot() !== initialSnapshot.value
}

const ensureDraftProject = async (): Promise<string | null> => {
  if (effectiveDocumentId.value) {
    return effectiveDocumentId.value
  }

  const contentToSave = getEditorContentHtml()
  if (isBlankEditorContent(contentToSave)) {
    return null
  }

  const response = await createWorkspaceProject({
    title: localTitle.value || defaultTitleText.value
  })
  const { project, document: createdDocument } = response.data

  await saveEditorDocument(createdDocument.id, {
    title: localTitle.value || defaultTitleText.value,
    content: contentToSave
  })

  draftDocumentId.value = createdDocument.id
  document.value = {
    ...createdDocument,
    content: contentToSave
  }
  emit('project-created', project)
  await router.replace(localePath(getWorkspaceDocPath(project.id)))

  return createdDocument.id
}

const scheduleAutosave = () => {
  markDirty()

  if (!dirty.value) {
    return
  }

  if (!effectiveDocumentId.value && isBlankEditorContent(getEditorContentHtml())) {
    return
  }

  if (autosaveTimer != null) {
    clearTimeout(autosaveTimer)
  }

  autosaveTimer = setTimeout(() => {
    autosaveTimer = null
    void persistDocument()
  }, AUTOSAVE_DEBOUNCE_MS)
}

const persistDocument = async () => {
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

    const contentToSave = getEditorContentHtml()
    const response = await saveEditorDocument(documentId, {
      title: localTitle.value || defaultTitleText.value,
      content: contentToSave
    })
    document.value = response.data.document
    lastSavedAt.value = Date.now()

    const currentContent = getEditorContentHtml()
    initialSnapshot.value = currentContent
    dirty.value = currentContent !== contentToSave

    if (dirty.value) {
      scheduleAutosave()
    }
  } catch {
    saveFailed.value = true
    message.error(t('editor.autosave.failed'))
  } finally {
    saving.value = false
  }
}

const flushAutosave = async () => {
  if (autosaveTimer != null) {
    clearTimeout(autosaveTimer)
    autosaveTimer = null
  }

  if (dirty.value) {
    await persistDocument()
  }
}

const onEditorUpdate = () => {
  scheduleAutosave()
}

watch(editorRef, async (editor) => {
  if (editor == null || pending.value) {
    return
  }

  await nextTick()
  editorReady.value = true
  resetDirtyBaseline()
})

onBeforeUnmount(() => {
  if (autosaveTimer != null) {
    clearTimeout(autosaveTimer)
    autosaveTimer = null
  }
})

const showAutosave = computed(() => Boolean(effectiveDocumentId.value || !isDraftMode.value))

onBeforeRouteLeave(async () => {
  if (saving.value) {
    return true
  }

  await flushAutosave()
  return true
})
</script>

<template>
  <div class="editor-workspace">
    <EditorWorkspaceHeader
      ref="headerRef"
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
        <ClientOnly v-if="!pending || editorReady">
          <YanivEditor
            ref="editorRef"
            :mode="EDITOR_MODE"
            :preset="EDITOR_PRESET"
            :locale="languageStore.currentLanguage"
            :initial-content="editorInitialContent"
            @update="onEditorUpdate"
            @update:content="onEditorUpdate"
          />
          <template #fallback>
            <div class="editor-workspace__loading">
              <a-spin />
            </div>
          </template>
        </ClientOnly>
      </div>
    </main>
  </div>
</template>

<style scoped lang="scss">
.editor-workspace {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--app-color-elevated);
}

.editor-workspace__body {
  display: flex;
  flex: 1;
  min-height: 0;
  padding: clamp(12px, 2vw, 20px) clamp(16px, 3vw, 24px) clamp(16px, 3vw, 24px);
}

.editor-workspace__surface {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  border: 1px solid var(--app-color-border);
  border-radius: 16px;
  background: var(--app-color-bg);
  box-shadow: 0 8px 24px rgb(15 23 42 / 6%);
}

.editor-workspace__loading {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
}
</style>
