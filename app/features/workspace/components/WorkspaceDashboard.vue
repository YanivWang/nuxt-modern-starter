<script setup lang="ts">
import { message } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'
import { PlusOutlined } from '~/utils/antdIcon'
import {
  deleteWorkspaceProject,
  fetchWorkspaceProjects,
  getWorkspaceDocPath,
  getWorkspaceNewDocPath
} from '../api'
import WorkspaceProjectCard from './WorkspaceProjectCard.vue'

const { localePath } = useLocalePath()
const { t } = useI18n()
const deletingProjectId = ref<string | null>(null)
const creatingProject = ref(false)

const newDocPath = computed(() => localePath(getWorkspaceNewDocPath()))

let editorRoutePrefetched = false

const prefetchEditorRoute = () => {
  if (editorRoutePrefetched) {
    return
  }

  editorRoutePrefetched = true
  void preloadRouteComponents(newDocPath.value)
  void import('~/features/editor')
}

onMounted(() => {
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(() => prefetchEditorRoute())
    return
  }

  setTimeout(prefetchEditorRoute, 200)
})

const {
  data: projects,
  pending,
  error,
  refresh
} = await useAsyncData('workspace-projects', async () => {
  const response = await fetchWorkspaceProjects()
  return response.data.projects
})

const handleCreateProject = async () => {
  if (creatingProject.value) {
    return
  }

  creatingProject.value = true
  prefetchEditorRoute()

  try {
    await navigateTo(newDocPath.value)
  } catch {
    creatingProject.value = false
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
    <div class="workspace-dashboard__header">
      <h1 class="workspace-dashboard__title">{{ $t('workspace.title') }}</h1>
      <a-button
        type="primary"
        size="large"
        :loading="creatingProject"
        @mouseenter="prefetchEditorRoute"
        @focus="prefetchEditorRoute"
        @click="handleCreateProject"
      >
        <PlusOutlined aria-hidden="true" />
        {{ $t('workspace.create') }}
      </a-button>
    </div>

    <div v-if="pending" class="workspace-loading">
      <a-spin />
    </div>

    <a-alert
      v-else-if="error"
      type="error"
      show-icon
      :message="$t('common.loadFailed')"
      class="workspace-error"
    >
      <template #action>
        <a-button size="small" @click="() => refresh()">{{ $t('common.retry') }}</a-button>
      </template>
    </a-alert>

    <a-empty
      v-else-if="!projects?.length"
      class="workspace-empty"
      :description="$t('workspace.empty')"
    />

    <div v-else class="workspace-grid">
      <WorkspaceProjectCard
        v-for="project in projects"
        :key="project.id"
        :project="project"
        :doc-path="localePath(getWorkspaceDocPath(project.id))"
        @delete="handleDeleteProject(project.id)"
      />
    </div>
  </section>
</template>

<style scoped lang="scss">
.workspace-dashboard {
  display: grid;
  gap: 24px;
}

.workspace-dashboard__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.workspace-dashboard__title {
  margin: 0;
  font-size: clamp(24px, 3vw, 32px);
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.workspace-grid {
  --workspace-card-min: 270px;
  --workspace-card-max: 360px;

  display: grid;
  gap: 20px;
  grid-template-columns: repeat(
    auto-fit,
    minmax(var(--workspace-card-min), var(--workspace-card-max))
  );
}

.workspace-loading,
.workspace-empty,
.workspace-error {
  display: grid;
  min-height: 220px;
  place-items: center;
}

@media (width <= 720px) {
  .workspace-dashboard__header {
    align-items: stretch;
    flex-direction: column;
  }

  .workspace-grid {
    --workspace-card-min: 230px;
    --workspace-card-max: 1fr;

    grid-template-columns: repeat(
      auto-fill,
      minmax(var(--workspace-card-min), var(--workspace-card-max))
    );
    gap: 16px;
  }
}
</style>
