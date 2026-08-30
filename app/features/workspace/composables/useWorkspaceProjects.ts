/*
  【文件职责】
    工作台项目列表：分页拉取、加载更多、删除、loading/error 状态与删除中标记。

  【架构位置】
    登录产品区 — app/features/workspace/composables，被 WorkspaceDashboard 消费。

  【主要导出 / 路由】
    useWorkspaceProjects、UseWorkspaceProjectsOptions、WORKSPACE_PROJECTS_PAGE_SIZE

  【依赖关系】
    - 依赖：~/api/workspace-project、workspace-project-delete.ts、workspace-project-load-more.ts、ant-design-vue message
    - 被引用：WorkspaceDashboard.vue、tests/unit/workspace-projects.test.ts

  【渲染 / 数据】
    CSR；useAsyncData key 固定为 workspace-projects 只负责第一页，
    后续页累积在 extraProjects，projects 为两者拼接。删除成功后 refresh 列表。

  【边界与注意】
    /projects 是分页接口，只读 data.projects 会在项目超过单页容量时静默丢数据，
    必须依据 pagination.hasMore 决定是否继续加载。
    refresh() 会丢弃已加载的后续页：删除会让服务端 offset 整体前移，
    保留旧页会导致重复或跳项，重新从第一页开始是唯一不会错乱的选择。
*/
import { message } from 'ant-design-vue'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { deleteWorkspaceProject, fetchWorkspaceProjects } from '~/api/workspace-project'
import type {
  WorkspaceProject,
  WorkspaceProjectListQuery,
  WorkspaceProjectPagination
} from '~/types/workspace-project'
import { performWorkspaceProjectDelete } from './workspace-project-delete'
import { performWorkspaceProjectLoadMore } from './workspace-project-load-more'

/** 单页条数。服务端上限为 100，这里取与服务端默认值一致的 20。 */
export const WORKSPACE_PROJECTS_PAGE_SIZE = 20

type ProjectsResponse = Promise<{
  data: { projects: WorkspaceProject[]; pagination: WorkspaceProjectPagination }
}>
type DeleteProjectResponse = Promise<unknown>

export type UseWorkspaceProjectsOptions = {
  fetchProjects?: (query?: WorkspaceProjectListQuery) => ProjectsResponse
  removeProject?: (projectId: string) => DeleteProjectResponse
  notifyDeleteSuccess?: () => void
  notifyDeleteError?: () => void
}

export const useWorkspaceProjects = ({
  fetchProjects = fetchWorkspaceProjects,
  removeProject = deleteWorkspaceProject,
  notifyDeleteSuccess,
  notifyDeleteError
}: UseWorkspaceProjectsOptions = {}) => {
  const { t } = useI18n()
  const deletingProjectId = ref<string | null>(null)
  const extraProjects = ref<WorkspaceProject[]>([])
  const pagination = ref<WorkspaceProjectPagination | null>(null)
  const loadingMore = ref(false)
  const loadMoreError = ref<unknown>(null)

  const {
    data: firstPage,
    pending,
    error,
    refresh
  } = useAsyncData('workspace-projects', async () => {
    const response = await fetchProjects({ limit: WORKSPACE_PROJECTS_PAGE_SIZE, offset: 0 })
    pagination.value = response.data.pagination
    // 重新拉第一页时丢弃后续页，避免与新的服务端顺序错位。
    extraProjects.value = []
    loadMoreError.value = null
    return response.data.projects
  })

  const projects = computed<WorkspaceProject[]>(() => [
    ...(firstPage.value ?? []),
    ...extraProjects.value
  ])

  const total = computed(() => pagination.value?.total ?? projects.value.length)
  const hasMore = computed(() => pagination.value?.hasMore ?? false)

  // 分页推进逻辑委托 performWorkspaceProjectLoadMore，保证在无 Nuxt 运行时的单测中可直接验证
  const loadMore = () =>
    performWorkspaceProjectLoadMore({
      loaded: projects.value,
      pageSize: WORKSPACE_PROJECTS_PAGE_SIZE,
      hasMore: hasMore.value,
      fetchProjects: (query) => fetchProjects(query),
      extraProjects,
      pagination,
      loadingMore,
      loadMoreError
    })

  // deleteProject 委托 performWorkspaceProjectDelete，统一 loading/refresh/通知
  const deleteProject = (projectId: string) =>
    performWorkspaceProjectDelete({
      projectId,
      removeProject,
      refresh,
      deletingProjectId,
      notifyDeleteSuccess:
        notifyDeleteSuccess ?? (() => message.success(t('workspace.deleteSuccess'))),
      notifyDeleteError: notifyDeleteError ?? (() => message.error(t('common.error')))
    })

  return {
    projects,
    pending,
    error,
    refresh,
    deletingProjectId,
    deleteProject,
    pagination,
    total,
    hasMore,
    loadMore,
    loadingMore,
    loadMoreError
  }
}
