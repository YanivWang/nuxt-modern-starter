<!--
  【文件职责】
    工作台主 UI：项目列表、创建按钮跳转 /docs/new、删除确认与列表刷新。
    idle 预加载 editor route 以加速进入编辑器。

  【架构位置】
    登录产品区 — app/features/workspace，由 app/pages/workspace/index.vue 挂载。

  【主要导出 / 路由】
    WorkspaceDashboard；创建 → /docs/new，卡片 → /docs/:id

  【依赖关系】
    - 依赖：~/api/workspace-project、../composables/useWorkspaceProjects、WorkspaceProjectCard、useLocalePath
    - 被引用：app/pages/workspace/index.vue

  【渲染 / 数据】
    CSR；列表与删除逻辑见 useWorkspaceProjects；创建仅 navigateTo /docs/new。

  【边界与注意】
    仅顶部「创建项目」按钮创建；无空白卡片入口；不直接 import editor feature，避免跨 feature 运行时耦合。
-->
<script setup lang="ts">
import { PlusOutlined } from '~/utils/antdIcon'
import { getWorkspaceDocPath, getWorkspaceNewDocPath } from '~/api/workspace-project'
import { useWorkspaceProjects } from '../composables/useWorkspaceProjects'
import WorkspaceProjectCard from './WorkspaceProjectCard.vue'

const { localePath } = useLocalePath()
const { projects, pending, error, refresh, deleteProject } = useWorkspaceProjects()

const navigatingToNewDoc = ref(false)
const newDocPath = computed(() => localePath(getWorkspaceNewDocPath()))

let editorRoutePrefetched = false

const prefetchEditorRoute = () => {
  if (editorRoutePrefetched) {
    return
  }

  editorRoutePrefetched = true
  void preloadRouteComponents(newDocPath.value)
}

onMounted(() => {
  // idle 时预加载 /docs/new 路由组件，缩短首次进入编辑器耗时
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(() => prefetchEditorRoute())
    return
  }

  setTimeout(prefetchEditorRoute, 200)
})

const handleCreateProject = async () => {
  if (navigatingToNewDoc.value) {
    return
  }

  navigatingToNewDoc.value = true
  prefetchEditorRoute()

  try {
    await navigateTo(newDocPath.value)
  } catch {
    navigatingToNewDoc.value = false
  }
}
</script>

<template>
  <section class="workspace-dashboard">
    <div class="app-product-page__header workspace-dashboard__header">
      <h1 class="app-product-page__title">{{ $t('workspace.title') }}</h1>
      <a-button
        type="primary"
        size="large"
        :loading="navigatingToNewDoc"
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
        @delete="deleteProject(project.id)"
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
  margin-bottom: 0;
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
