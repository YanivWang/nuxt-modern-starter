<script setup lang="ts">
import { message } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'
import {
  AppstoreOutlined,
  ArrowRightOutlined,
  ReadOutlined,
  RocketOutlined
} from '~/utils/antdIcon'
import {
  createWorkspaceProject,
  deleteWorkspaceProject,
  fetchWorkspaceProjects,
  getWorkspaceDocPath,
  type WorkspaceProject
} from '../api'

const { localePath } = useLocalePath()
const router = useRouter()
const { t } = useI18n()
const creating = ref(false)
const deletingProjectId = ref<string | null>(null)

const {
  data: projects,
  pending,
  refresh
} = await useAsyncData('workspace-projects', async () => {
  const response = await fetchWorkspaceProjects()
  return response.data.projects
})

const statusLabel = (status: WorkspaceProject['status']) => {
  const labels = {
    draft: 'workspace.status.draft',
    ready: 'workspace.status.ready',
    shared: 'workspace.status.shared'
  } as const

  return labels[status]
}

const actionCards = [
  {
    key: 'ai',
    icon: RocketOutlined,
    title: 'workspace.actions.ai.title',
    description: 'workspace.actions.ai.description'
  },
  {
    key: 'import',
    icon: ReadOutlined,
    title: 'workspace.actions.import.title',
    description: 'workspace.actions.import.description'
  },
  {
    key: 'blank',
    icon: AppstoreOutlined,
    title: 'workspace.actions.blank.title',
    description: 'workspace.actions.blank.description'
  }
] as const

const handleAction = (key: (typeof actionCards)[number]['key']) => {
  if (key === 'blank') {
    void handleCreateProject()
  }
}

const handleCreateProject = async () => {
  creating.value = true

  try {
    const response = await createWorkspaceProject({
      title: t('workspace.actions.blank.title'),
      description: t('workspace.actions.blank.description')
    })
    await refresh()
    await router.push(localePath(getWorkspaceDocPath(response.data.project.id)))
  } catch {
    message.error(t('common.error'))
  } finally {
    creating.value = false
  }
}

const handleDeleteProject = async (projectId: string) => {
  deletingProjectId.value = projectId

  try {
    await deleteWorkspaceProject(projectId)
    await refresh()
    message.success(t('workspace.deleteSuccess'))
  } catch {
    message.error(t('common.error'))
  } finally {
    deletingProjectId.value = null
  }
}
</script>

<template>
  <section class="workspace-dashboard">
    <div class="workspace-dashboard__hero">
      <div>
        <p class="page-eyebrow">{{ $t('workspace.eyebrow') }}</p>
        <h1 class="workspace-dashboard__title">{{ $t('workspace.title') }}</h1>
        <p class="workspace-dashboard__lead">{{ $t('workspace.lead') }}</p>
      </div>
      <a-button type="primary" size="large" :loading="creating" @click="handleCreateProject">
        {{ $t('workspace.create') }}
      </a-button>
    </div>

    <div class="workspace-actions">
      <article
        v-for="action in actionCards"
        :key="action.key"
        class="workspace-action"
        :class="{ 'workspace-action--clickable': action.key === 'blank' }"
        @click="action.key === 'blank' && !creating ? handleAction(action.key) : undefined"
      >
        <span class="workspace-action__icon">
          <component :is="action.icon" aria-hidden="true" />
        </span>
        <div>
          <h2>{{ $t(action.title) }}</h2>
          <p>{{ $t(action.description) }}</p>
        </div>
        <ArrowRightOutlined aria-hidden="true" class="workspace-action__arrow" />
      </article>
    </div>

    <div class="workspace-toolbar">
      <a-segmented
        :value="$t('workspace.filters.all')"
        :options="[
          $t('workspace.filters.all'),
          $t('workspace.filters.recent'),
          $t('workspace.filters.shared')
        ]"
      />
      <a-input-search class="workspace-toolbar__search" :placeholder="$t('workspace.search')" />
    </div>

    <div v-if="pending" class="workspace-loading">
      <a-spin />
    </div>

    <a-empty
      v-else-if="!projects?.length"
      class="workspace-empty"
      :description="$t('workspace.empty')"
    />

    <div v-else class="workspace-grid">
      <article
        v-for="project in projects"
        :key="project.id"
        class="workspace-project"
        :class="`workspace-project--${project.accent}`"
      >
        <NuxtLink
          class="workspace-project__preview"
          :to="localePath(getWorkspaceDocPath(project.id))"
        >
          <div class="workspace-project__slide">
            <span />
            <strong>{{ project.title }}</strong>
            <small>{{ project.description }}</small>
          </div>
        </NuxtLink>

        <div class="workspace-project__body">
          <a-tag>{{ $t(statusLabel(project.status)) }}</a-tag>
          <h2>{{ project.title }}</h2>
          <p>{{ project.updatedAt }} · {{ project.slideCount }} {{ $t('workspace.slides') }}</p>

          <div class="workspace-project__footer">
            <NuxtLink :to="localePath(getWorkspaceDocPath(project.id))">{{
              $t('workspace.edit')
            }}</NuxtLink>
            <a-popconfirm
              :title="$t('workspace.deleteConfirm', { title: project.title })"
              :ok-text="$t('workspace.delete')"
              :cancel-text="$t('workspace.deleteCancel')"
              @confirm="handleDeleteProject(project.id)"
            >
              <a-button
                type="link"
                danger
                size="small"
                class="workspace-project__delete"
                :loading="deletingProjectId === project.id"
                @click.stop
              >
                {{ $t('workspace.delete') }}
              </a-button>
            </a-popconfirm>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped lang="scss">
.workspace-dashboard {
  display: grid;
  gap: 28px;
}

.workspace-dashboard__hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.workspace-dashboard__title {
  max-width: 760px;
  margin: 0;
  font-size: clamp(30px, 4vw, 44px);
  line-height: 1.1;
  letter-spacing: -0.03em;
}

.workspace-dashboard__lead {
  max-width: 680px;
  margin: 14px 0 0;
  color: var(--app-color-muted);
  font-size: 16px;
  line-height: 1.7;
}

.workspace-actions,
.workspace-grid {
  display: grid;
  gap: 18px;
}

.workspace-actions {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.workspace-action {
  display: grid;
  align-items: center;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 16px;
  padding: 22px;
  border: 1px solid var(--app-color-border);
  border-radius: 18px;
  background: var(--app-color-bg);
  box-shadow: 0 12px 32px rgb(15 23 42 / 5%);

  &--clickable {
    cursor: pointer;
  }

  h2,
  p {
    margin: 0;
  }

  h2 {
    font-size: 17px;
  }

  p {
    margin-top: 6px;
    color: var(--app-color-muted);
    font-size: 13px;
    line-height: 1.5;
  }
}

.workspace-action__icon {
  display: grid;
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: rgb(22 119 255 / 10%);
  color: var(--app-color-primary);
  place-items: center;
}

.workspace-action__arrow {
  color: var(--app-color-muted);
}

.workspace-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-block: 4px 12px;
  border-bottom: 1px solid var(--app-color-border);
}

.workspace-toolbar__search {
  width: min(280px, 100%);
}

.workspace-loading,
.workspace-empty {
  display: grid;
  min-height: 220px;
  place-items: center;
}

.workspace-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.workspace-project {
  overflow: hidden;
  border: 1px solid var(--app-color-border);
  border-radius: 20px;
  background: var(--app-color-bg);
  box-shadow: 0 12px 32px rgb(15 23 42 / 6%);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;

  &:hover {
    border-color: rgb(22 119 255 / 22%);
    box-shadow: 0 18px 42px rgb(15 23 42 / 10%);
    transform: translateY(-2px);
  }
}

.workspace-project__preview {
  display: block;
  padding: 12px;
  text-decoration: none;
}

.workspace-project__slide {
  display: grid;
  min-height: 162px;
  align-content: end;
  gap: 8px;
  padding: 22px;
  border-radius: 14px;
  background:
    linear-gradient(135deg, var(--project-accent-soft), transparent 58%),
    linear-gradient(90deg, rgb(255 255 255 / 72%), rgb(255 255 255 / 30%));

  span {
    width: 46%;
    height: 8px;
    border-radius: 999px;
    background: var(--project-accent);
  }

  strong {
    color: #172033;
    font-size: 17px;
    line-height: 1.35;
  }

  small {
    color: rgb(23 32 51 / 62%);
    line-height: 1.5;
  }
}

.workspace-project__body {
  padding: 0 18px 18px;

  h2 {
    margin: 14px 0 8px;
    font-size: 18px;
  }

  p {
    margin: 0;
    color: var(--app-color-muted);
    font-size: 13px;
  }
}

.workspace-project__footer {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 18px;

  a {
    color: var(--app-color-primary);
    font-size: 14px;
    font-weight: 700;
    text-decoration: none;
  }
}

.workspace-project__delete {
  padding-inline: 0;
  font-size: 14px;
  font-weight: 700;
}

.workspace-project--blue {
  --project-accent: #1677ff;
  --project-accent-soft: rgb(22 119 255 / 18%);
}

.workspace-project--green {
  --project-accent: #12b886;
  --project-accent-soft: rgb(18 184 134 / 18%);
}

.workspace-project--violet {
  --project-accent: #7950f2;
  --project-accent-soft: rgb(121 80 242 / 18%);
}

.workspace-project--amber {
  --project-accent: #f59f00;
  --project-accent-soft: rgb(245 159 0 / 20%);
}

.workspace-project--cyan {
  --project-accent: #15aabf;
  --project-accent-soft: rgb(21 170 191 / 18%);
}

.workspace-project--rose {
  --project-accent: #e64980;
  --project-accent-soft: rgb(230 73 128 / 18%);
}

@media (width <= 1160px) {
  .workspace-actions,
  .workspace-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (width <= 720px) {
  .workspace-dashboard__hero,
  .workspace-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .workspace-actions,
  .workspace-grid {
    grid-template-columns: 1fr;
  }
}
</style>
