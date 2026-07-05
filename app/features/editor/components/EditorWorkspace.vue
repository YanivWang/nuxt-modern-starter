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

const { t } = useI18n()
const { localePath } = useLocalePath()
const content = ref('')
const saving = ref(false)

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
    content.value = nextDocument?.content ?? ''
  },
  { immediate: true }
)

const displayTitle = computed(
  () => props.project?.title || document.value?.title || t('editor.title')
)

const handleSave = async () => {
  if (!props.documentId) {
    return
  }

  saving.value = true

  try {
    const response = await saveEditorDocument(props.documentId, {
      title: document.value?.title,
      content: content.value
    })
    document.value = response.data.document
    message.success(t('workspace.save'))
  } catch {
    message.error(t('common.error'))
  } finally {
    saving.value = false
  }
}
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

      <div class="editor-workspace__actions">
        <a-button v-if="documentId" type="primary" :loading="saving" @click="handleSave">
          {{ $t('workspace.save') }}
        </a-button>
      </div>
    </header>

    <div class="editor-workspace__surface">
      <div v-if="pending" class="editor-workspace__loading">
        <a-spin />
      </div>
      <ClientOnly v-else>
        <YanivEditor
          v-model="content"
          preset="full"
          mode="edit"
          :placeholder="$t('editor.placeholder')"
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
