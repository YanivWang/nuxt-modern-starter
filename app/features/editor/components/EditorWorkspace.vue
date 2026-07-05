<script setup lang="ts">
import { message } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'
import { YanivEditor } from '@yanivjs/yaniv-editor'
import '@yanivjs/yaniv-editor/style.css'
import { fetchEditorDocument, saveEditorDocument } from '../../../apis/editor'
import type { WorkspaceProject } from '../../workspace/api'
import { ArrowLeftOutlined } from '~/utils/antdIcon'

type EditorProjectContext = Pick<WorkspaceProject, 'id' | 'title'>

const props = defineProps<{
  documentId?: string | null
  project?: EditorProjectContext | null
}>()

const AUTOSAVE_DEBOUNCE_MS = 2000

const { t } = useI18n()
const languageStore = useLanguageStore()
const { localePath } = useLocalePath()
const editorRef = ref<InstanceType<typeof YanivEditor> | null>(null)
const editorInitialContent = ref('<p></p>')
const editorReady = ref(false)
const saving = ref(false)
const saveFailed = ref(false)
const dirty = ref(false)
const lastSavedAt = ref<number | null>(null)
const initialSnapshot = ref('')

const EDITOR_MODE = 'edit' as const
const EDITOR_PRESET = 'full' as const

let autosaveTimer: ReturnType<typeof setTimeout> | null = null

const { data: document, pending } = await useAsyncData(
  props.documentId ? `editor-document:${props.documentId}` : 'editor-document:new',
  async () => {
    if (!props.documentId) {
      return null
    }

    const response = await fetchEditorDocument(props.documentId)
    return response.data.document
  }
)

watch(
  document,
  (nextDocument) => {
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

const displayTitle = computed(
  () => props.project?.title || document.value?.title || t('editor.title')
)

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
  if (pending.value || !editorReady.value) {
    return
  }

  dirty.value = takeSnapshot() !== initialSnapshot.value
}

const scheduleAutosave = () => {
  markDirty()

  if (!dirty.value || !props.documentId) {
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
  if (!props.documentId || pending.value || saving.value || !dirty.value) {
    return
  }

  const contentToSave = getEditorContentHtml()
  saving.value = true
  saveFailed.value = false

  try {
    const response = await saveEditorDocument(props.documentId, {
      title: document.value?.title,
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

  if (dirty.value && props.documentId) {
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
    <header class="editor-workspace__header">
      <div class="editor-workspace__header-start">
        <NuxtLink class="editor-workspace__back" :to="localePath('/app/workspace')">
          <ArrowLeftOutlined aria-hidden="true" />
          <span>{{ $t('workspace.backToWorkspace') }}</span>
        </NuxtLink>
        <div>
          <p class="editor-workspace__eyebrow">{{ $t('editor.eyebrow') }}</p>
          <h1 class="editor-workspace__title">{{ displayTitle }}</h1>
        </div>
      </div>

      <div v-if="documentId" class="editor-workspace__actions">
        <p
          v-if="autosaveHintText"
          class="editor-workspace__autosave"
          :class="{ 'is-error': saveFailed, 'is-saving': saving }"
        >
          {{ autosaveHintText }}
        </p>
      </div>
    </header>

    <div class="editor-workspace__surface">
      <div v-if="pending" class="editor-workspace__loading">
        <a-spin />
      </div>
      <ClientOnly v-if="!pending">
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
  </div>
</template>

<style scoped lang="scss">
.editor-workspace {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: clamp(16px, 3vw, 24px);
  background:
    radial-gradient(circle at 18% 18%, rgb(22 119 255 / 10%), transparent 34%), var(--app-color-bg);
}

.editor-workspace__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-shrink: 0;
  margin-bottom: 20px;
}

.editor-workspace__header-start {
  display: flex;
  align-items: flex-start;
  gap: 18px;
  min-width: 0;
}

.editor-workspace__back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  margin-top: 4px;
  padding: 8px 12px;
  border-radius: 10px;
  color: var(--app-color-muted);
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s ease;

  &:hover {
    background: rgb(15 23 42 / 4%);
    color: var(--app-color-text);
  }
}

.editor-workspace__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.editor-workspace__autosave {
  margin: 0;
  color: var(--app-color-muted);
  font-size: 12px;
  white-space: nowrap;

  &.is-saving {
    color: var(--app-color-primary);
  }

  &.is-error {
    color: #cf1322;
  }
}

.editor-workspace__eyebrow {
  margin: 0 0 8px;
  color: var(--app-color-primary);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.editor-workspace__title {
  margin: 0;
  font-size: clamp(22px, 3vw, 28px);
  letter-spacing: -0.03em;
}

.editor-workspace__surface {
  display: flex;
  flex: 1;
  min-height: 0;
  padding: clamp(16px, 3vw, 24px);
  border: 1px solid var(--app-color-border);
  border-radius: 24px;
  background: var(--app-color-bg);
  box-shadow: 0 12px 32px rgb(15 23 42 / 5%);
}

.editor-workspace__loading {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
}

@media (width <= 720px) {
  .editor-workspace__header {
    flex-direction: column;
  }

  .editor-workspace__back span {
    display: none;
  }
}
</style>
