<!--
  【文件职责】
    单个 workspace 项目卡片：缩略图装饰、标题链到编辑器、删除菜单。
    share / download / favorite 按钮为 UI 占位，无后端逻辑。

  【架构位置】
    登录产品区 — app/features/workspace 内部组件，WorkspaceDashboard 网格项。

  【主要导出 / 路由】
    WorkspaceProjectCard；docPath prop → /docs/:id

  【依赖关系】
    - 依赖：../api WorkspaceProject、formatWorkspaceDateTime
    - 被引用：WorkspaceDashboard

  【渲染 / 数据】
    无 API 调用；delete 事件由父组件调用 deleteWorkspaceProject。

  【边界与注意】
    favorite / share / download / preview-actions 均为 @click.prevent 占位，待产品实现。
-->
<script setup lang="ts">
import {
  DownloadOutlined,
  EllipsisOutlined,
  ShareAltOutlined,
  StarOutlined
} from '~/utils/antdIcon'
import { formatWorkspaceDateTime } from '~/utils/formatDate'
import type { WorkspaceProject } from '../types'

const props = defineProps<{
  project: WorkspaceProject
  docPath: string
}>()

const emit = defineEmits<{
  delete: []
}>()

const languageStore = useLanguageStore()

const formattedUpdatedAt = computed(() =>
  formatWorkspaceDateTime(props.project.updatedAt, languageStore.currentLanguage)
)
</script>

<template>
  <article class="workspace-card" :class="`workspace-card--${project.accent}`">
    <NuxtLink class="workspace-card__preview" :to="docPath">
      <div class="workspace-card__thumbnail" aria-hidden="true">
        <div class="workspace-card__cover">
          <div class="workspace-card__cover-bg" />
          <div class="workspace-card__cover-glow workspace-card__cover-glow--left" />
          <div class="workspace-card__cover-glow workspace-card__cover-glow--right" />

          <div class="workspace-card__cover-frame">
            <div class="workspace-card__cover-slide">
              <span class="workspace-card__cover-accent" />
              <span class="workspace-card__cover-line workspace-card__cover-line--wide" />
              <span class="workspace-card__cover-line" />
              <span class="workspace-card__cover-line workspace-card__cover-line--short" />
              <div class="workspace-card__cover-chart">
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        class="workspace-card__favorite"
        aria-hidden="true"
        tabindex="-1"
        @click.prevent
      >
        <!-- UI 占位：收藏功能未实现 -->
        <StarOutlined aria-hidden="true" />
      </button>

      <div class="workspace-card__preview-actions">
        <!-- share / download / more 为 UI 占位，无 API -->
        <button
          type="button"
          class="workspace-card__preview-action"
          :aria-label="$t('workspace.share')"
          @click.prevent
        >
          <ShareAltOutlined aria-hidden="true" />
        </button>
        <button
          type="button"
          class="workspace-card__preview-action"
          :aria-label="$t('workspace.download')"
          @click.prevent
        >
          <DownloadOutlined aria-hidden="true" />
        </button>
        <button
          type="button"
          class="workspace-card__preview-action"
          :aria-label="$t('workspace.more')"
          @click.prevent
        >
          <EllipsisOutlined aria-hidden="true" />
        </button>
      </div>
    </NuxtLink>

    <div class="workspace-card__body">
      <NuxtLink class="workspace-card__title" :to="docPath">
        {{ project.title }}
      </NuxtLink>

      <div class="workspace-card__meta">
        <p class="workspace-card__meta-text">
          {{ formattedUpdatedAt }}
          <span class="workspace-card__meta-dot" aria-hidden="true">·</span>
          {{ $t('workspace.browse') }}
        </p>

        <a-dropdown :trigger="['click']" placement="bottomRight" @click.stop>
          <button
            type="button"
            class="workspace-card__more"
            :aria-label="$t('workspace.more')"
            @click.stop
          >
            <EllipsisOutlined aria-hidden="true" />
          </button>
          <template #overlay>
            <div class="workspace-card__menu">
              <a-popconfirm
                :title="$t('workspace.deleteConfirm', { title: project.title })"
                :ok-text="$t('workspace.delete')"
                :cancel-text="$t('workspace.deleteCancel')"
                @confirm="emit('delete')"
              >
                <button type="button" class="workspace-card__menu-delete" @click.stop>
                  {{ $t('workspace.delete') }}
                </button>
              </a-popconfirm>
            </div>
          </template>
        </a-dropdown>
      </div>
    </div>
  </article>
</template>
