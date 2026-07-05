<script setup lang="ts">
import { message } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'
import { PlusOutlined } from '~/utils/antdIcon'
import { formatDateOnly } from '~/utils/formatDate'
import {
  deleteWorkspaceProject,
  fetchWorkspaceProjects,
  getWorkspaceDocPath,
  getWorkspaceNewDocPath
} from '../api'

const { localePath } = useLocalePath()
const router = useRouter()
const { t } = useI18n()
const deletingProjectId = ref<string | null>(null)

const {
  data: projects,
  pending,
  refresh
} = await useAsyncData('workspace-projects', async () => {
  const response = await fetchWorkspaceProjects()
  return response.data.projects
})

const handleCreateProject = () => {
  void router.push(localePath(getWorkspaceNewDocPath()))
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
    <div class="workspace-dashboard__header">
      <h1 class="workspace-dashboard__title">{{ $t('workspace.title') }}</h1>
      <a-button type="primary" size="large" @click="handleCreateProject">
        <PlusOutlined aria-hidden="true" />
        {{ $t('workspace.create') }}
      </a-button>
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
          <div class="workspace-project__slide" aria-hidden="true">
            <span class="workspace-project__slide-bar" />
            <span class="workspace-project__slide-line" />
            <span class="workspace-project__slide-line workspace-project__slide-line--short" />
          </div>
        </NuxtLink>

        <div class="workspace-project__body">
          <NuxtLink
            class="workspace-project__title"
            :to="localePath(getWorkspaceDocPath(project.id))"
          >
            {{ project.title }}
          </NuxtLink>
          <p>{{ formatDateOnly(project.updatedAt) }}</p>

          <div class="workspace-project__footer">
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

.workspace-dashboard__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.workspace-dashboard__title {
  margin: 0;
  font-size: clamp(30px, 4vw, 44px);
  line-height: 1.1;
  letter-spacing: -0.03em;
}

.workspace-grid {
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.workspace-loading,
.workspace-empty {
  display: grid;
  min-height: 220px;
  place-items: center;
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
  gap: 10px;
  padding: 22px;
  border-radius: 14px;
  background:
    linear-gradient(135deg, var(--project-accent-soft), transparent 58%),
    linear-gradient(90deg, rgb(255 255 255 / 72%), rgb(255 255 255 / 30%));
}

.workspace-project__slide-bar {
  width: 46%;
  height: 8px;
  border-radius: 999px;
  background: var(--project-accent);
}

.workspace-project__slide-line {
  width: 72%;
  height: 6px;
  border-radius: 999px;
  background: rgb(23 32 51 / 12%);

  &--short {
    width: 48%;
  }
}

.workspace-project__body {
  padding: 0 18px 18px;

  p {
    margin: 8px 0 0;
    color: var(--app-color-muted);
    font-size: 13px;
  }
}

.workspace-project__title {
  display: block;
  margin-top: 14px;
  color: inherit;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.35;
  text-decoration: none;

  &:hover {
    color: var(--app-color-primary);
  }
}

.workspace-project__footer {
  display: flex;
  align-items: center;
  margin-top: 18px;
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
  .workspace-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (width <= 720px) {
  .workspace-dashboard__header {
    align-items: stretch;
    flex-direction: column;
  }

  .workspace-grid {
    grid-template-columns: 1fr;
  }
}
</style>
