<!--
  【文件职责】
    编辑器顶栏：返回工作台、可编辑项目标题、自动保存状态提示、UserAccountMenu。
    标题编辑 emit 给 EditorWorkspace 持久化（document + workspace project 双写）。

  【架构位置】
    登录产品区 — app/features/editor 内部组件，EditorWorkspace 子组件。

  【主要导出 / 路由】
    EditorWorkspaceHeader；返回链 localePath('/workspace')

  【依赖关系】
    - 依赖：UserAccountMenu、useLocalePath
    - 被引用：EditorWorkspace.vue

  【渲染 / 数据】
    无 API；autosave 文案由父组件 computed 传入。

  【边界与注意】
    titleInputRef expose 供父组件 focus；Enter 提交 / Escape 取消。
-->
<script setup lang="ts">
import { ArrowLeftOutlined } from '~/utils/antdIcon'
import UserAccountMenu from '~/components/layout/UserAccountMenu.vue'

defineProps<{
  localTitle: string
  editableTitle: string
  isEditingTitle: boolean
  titleSaving: boolean
  autosaveHintText: string
  saving: boolean
  saveFailed: boolean
  showAutosave: boolean
}>()

const emit = defineEmits<{
  'start-title-edit': []
  'commit-title-edit': []
  'cancel-title-edit': []
  'title-keydown': [event: KeyboardEvent]
  'update:editableTitle': [value: string]
}>()

const { localePath } = useLocalePath()

const titleInputRef = ref<HTMLInputElement | null>(null)

defineExpose({
  titleInputRef
})
</script>

<template>
  <header class="editor-workspace-header">
    <div class="editor-workspace-header__start">
      <NuxtLink class="editor-workspace-header__back" :to="localePath('/workspace')">
        <ArrowLeftOutlined aria-hidden="true" />
        <span>{{ $t('workspace.backToWorkspace') }}</span>
      </NuxtLink>
      <div class="editor-workspace-header__title-wrap">
        <h1
          v-if="!isEditingTitle"
          class="editor-workspace-header__title"
          :class="{ 'is-saving': titleSaving }"
          role="button"
          tabindex="0"
          :aria-label="$t('workspace.projectName')"
          @click="emit('start-title-edit')"
          @keydown.enter.prevent="emit('start-title-edit')"
        >
          {{ localTitle }}
        </h1>
        <input
          v-else
          ref="titleInputRef"
          :value="editableTitle"
          class="editor-workspace-header__title editor-workspace-header__title-input"
          type="text"
          :aria-label="$t('workspace.projectName')"
          @input="emit('update:editableTitle', ($event.target as HTMLInputElement).value)"
          @blur="emit('commit-title-edit')"
          @keydown="emit('title-keydown', $event)"
        />
      </div>
    </div>

    <div class="editor-workspace-header__end">
      <p
        v-if="showAutosave && autosaveHintText"
        class="editor-workspace-header__autosave"
        :class="{ 'is-error': saveFailed, 'is-saving': saving }"
      >
        {{ autosaveHintText }}
      </p>
      <UserAccountMenu />
    </div>
  </header>
</template>

<style scoped lang="scss">
.editor-workspace-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-shrink: 0;
  padding: 12px clamp(16px, 3vw, 24px);
  background: var(--app-color-bg);
  border-bottom: 1px solid var(--app-color-border);
}

.editor-workspace-header__start {
  --editor-header-nav-size: 13px;
  --editor-header-title-size: calc(var(--editor-header-nav-size) + 4px);

  display: flex;
  align-items: center;
  gap: 18px;
  min-width: 0;
}

.editor-workspace-header__end {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.editor-workspace-header__back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  padding: 8px 12px;
  border-radius: 10px;
  color: var(--app-color-muted);
  font-size: var(--editor-header-nav-size);
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s ease;

  &:hover {
    background: var(--app-color-nav-hover-bg);
    color: var(--app-color-text);
  }
}

.editor-workspace-header__autosave {
  margin: 0;
  color: var(--app-color-muted);
  font-size: var(--app-text-xs);
  white-space: nowrap;

  &.is-saving {
    color: var(--app-color-primary);
  }

  &.is-error {
    color: var(--app-color-danger);
  }
}

.editor-workspace-header__title-wrap {
  min-width: 0;
}

.editor-workspace-header__title {
  margin: 0;
  font-size: var(--editor-header-title-size);
  font-weight: 700;
  line-height: 1.3;
  cursor: text;
  border-radius: 6px;
  transition: background 0.15s ease;

  &:hover,
  &:focus-visible {
    background: var(--app-color-nav-active-bg);
    outline: none;
  }

  &.is-saving {
    opacity: 0.7;
  }
}

.editor-workspace-header__title-input {
  display: block;
  width: min(100%, 520px);
  padding: 2px 6px;
  margin: -2px -6px;
  border: none;
  outline: none;
  background: var(--app-color-primary-subtle);
  box-shadow: inset 0 0 0 1px var(--app-color-primary-border);
  font-size: var(--editor-header-title-size);
  font-weight: 700;
  line-height: 1.3;
  color: inherit;
}

@media (width <= 720px) {
  .editor-workspace-header {
    flex-direction: column;
    align-items: stretch;
  }

  .editor-workspace-header__end {
    justify-content: flex-end;
  }

  .editor-workspace-header__back span {
    display: none;
  }
}
</style>
