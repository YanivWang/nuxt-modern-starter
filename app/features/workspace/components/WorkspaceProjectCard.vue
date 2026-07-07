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
import type { WorkspaceProject } from '../api'

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

<style scoped lang="scss">
.workspace-card {
  width: 100%;
  overflow: hidden;
  border: 1px solid rgb(15 23 42 / 6%);
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 2px 8px rgb(15 23 42 / 4%);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    border-color: rgb(15 23 42 / 10%);
    box-shadow: 0 8px 24px rgb(15 23 42 / 8%);
  }
}

.workspace-card__preview {
  position: relative;
  display: block;
  text-decoration: none;
}

.workspace-card__thumbnail {
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: #f5f7fa;
}

.workspace-card__cover {
  position: relative;
  height: 100%;
  overflow: hidden;
}

.workspace-card__cover-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 82% 18%, var(--project-accent-soft), transparent 42%),
    radial-gradient(circle at 12% 88%, var(--project-accent-soft), transparent 36%),
    linear-gradient(
      145deg,
      rgb(255 255 255 / 98%),
      rgb(248 250 252 / 94%) 52%,
      rgb(241 245 249 / 96%)
    );
}

.workspace-card__cover-bg::after {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgb(15 23 42 / 7%) 0.6px, transparent 0.6px);
  background-size: 14px 14px;
  content: '';
  mask-image: linear-gradient(180deg, rgb(0 0 0 / 55%), transparent 88%);
}

.workspace-card__cover-glow {
  position: absolute;
  border-radius: 999px;
  filter: blur(18px);
  opacity: 0.75;
  pointer-events: none;

  &--left {
    top: -18%;
    left: -8%;
    width: 42%;
    height: 52%;
    background: var(--project-accent-soft);
  }

  &--right {
    right: -6%;
    bottom: -22%;
    width: 36%;
    height: 48%;
    background: var(--project-accent-soft);
  }
}

.workspace-card__cover-frame {
  position: relative;
  z-index: 1;
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
  padding: clamp(12px, 10%, 20px);
}

.workspace-card__cover-slide {
  display: grid;
  width: min(78%, 220px);
  aspect-ratio: 4 / 3;
  align-content: start;
  gap: 6px;
  padding: clamp(10px, 6%, 14px);
  border: 1px solid rgb(255 255 255 / 88%);
  border-radius: 10px;
  background: rgb(255 255 255 / 94%);
  box-shadow:
    0 10px 28px rgb(15 23 42 / 10%),
    0 2px 6px rgb(15 23 42 / 6%);
  transform: rotate(-2deg);
  transition: transform 0.25s ease;
}

.workspace-card:hover .workspace-card__cover-slide {
  transform: rotate(0deg) translateY(-2px);
}

.workspace-card__cover-accent {
  width: 38%;
  height: 6px;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--project-accent), rgb(255 255 255 / 0%) 120%);
}

.workspace-card__cover-line {
  width: 72%;
  height: 4px;
  border-radius: 999px;
  background: rgb(15 23 42 / 8%);

  &--wide {
    width: 86%;
    height: 5px;
    margin-top: 2px;
    background: rgb(15 23 42 / 12%);
  }

  &--short {
    width: 48%;
  }
}

.workspace-card__cover-chart {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 28px;
  margin-top: auto;
  padding-top: 4px;

  span {
    flex: 1;
    border-radius: 3px 3px 1px 1px;
    background: rgb(15 23 42 / 7%);

    &:nth-child(1) {
      height: 42%;
      background: var(--project-accent-soft);
    }

    &:nth-child(2) {
      height: 68%;
    }

    &:nth-child(3) {
      height: 52%;
      background: var(--project-accent);
      opacity: 0.72;
    }

    &:nth-child(4) {
      height: 36%;
    }
  }
}

.workspace-card__favorite {
  position: absolute;
  top: 10px;
  left: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: rgb(15 23 42 / 42%);
  color: #fff;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.2s ease;

  &:hover {
    background: rgb(15 23 42 / 58%);
  }
}

.workspace-card__preview-actions {
  position: absolute;
  right: 10px;
  bottom: 10px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  opacity: 0;
  visibility: hidden;
  transition:
    opacity 0.2s ease,
    visibility 0.2s ease;
}

.workspace-card:hover .workspace-card__preview-actions {
  opacity: 1;
  visibility: visible;
}

.workspace-card__preview-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 0;
  border-radius: 8px;
  background: rgb(255 255 255 / 92%);
  color: rgb(15 23 42 / 72%);
  cursor: pointer;
  font-size: 14px;
  box-shadow: 0 2px 8px rgb(15 23 42 / 10%);
  transition:
    background 0.2s ease,
    color 0.2s ease;

  &:hover {
    background: #fff;
    color: var(--app-color-primary);
  }
}

.workspace-card__body {
  padding: 12px 14px 14px;
}

.workspace-card__title {
  display: block;
  overflow: hidden;
  color: #1f2937;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.4;
  text-decoration: none;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    color: var(--app-color-primary);
  }
}

.workspace-card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 8px;
}

.workspace-card__meta-text {
  min-width: 0;
  margin: 0;
  overflow: hidden;
  color: #9ca3af;
  font-size: 12px;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.workspace-card__meta-dot {
  margin-inline: 4px;
}

.workspace-card__more {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  font-size: 16px;
  transition:
    background 0.2s ease,
    color 0.2s ease;

  &:hover {
    background: rgb(15 23 42 / 5%);
    color: #6b7280;
  }
}

.workspace-card__menu {
  min-width: 120px;
  padding: 6px;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 8px 24px rgb(15 23 42 / 12%);
}

.workspace-card__menu-delete {
  display: block;
  width: 100%;
  padding: 8px 12px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #ff4d4f;
  cursor: pointer;
  font-size: 14px;
  text-align: left;
  transition: background 0.2s ease;

  &:hover {
    background: rgb(255 77 79 / 8%);
  }
}

.workspace-card--blue {
  --project-accent: #1677ff;
  --project-accent-soft: rgb(22 119 255 / 18%);
}

.workspace-card--green {
  --project-accent: #12b886;
  --project-accent-soft: rgb(18 184 134 / 18%);
}

.workspace-card--violet {
  --project-accent: #7950f2;
  --project-accent-soft: rgb(121 80 242 / 18%);
}

.workspace-card--amber {
  --project-accent: #f59f00;
  --project-accent-soft: rgb(245 159 0 / 20%);
}

.workspace-card--cyan {
  --project-accent: #15aabf;
  --project-accent-soft: rgb(21 170 191 / 18%);
}

.workspace-card--rose {
  --project-accent: #e64980;
  --project-accent-soft: rgb(230 73 128 / 18%);
}
</style>
