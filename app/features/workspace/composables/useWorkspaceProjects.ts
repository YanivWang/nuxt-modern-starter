/*
  【文件职责】
    工作台项目列表：拉取、删除、loading/error 状态与删除中标记。

  【架构位置】
    登录产品区 — app/features/workspace/composables，被 WorkspaceDashboard 消费。

  【主要导出 / 路由】
    useWorkspaceProjects、UseWorkspaceProjectsOptions

  【依赖关系】
    - 依赖：~/api/workspace-project、workspace-project-delete.ts、ant-design-vue message
    - 被引用：WorkspaceDashboard.vue、tests/unit/workspace-projects.test.ts

  【渲染 / 数据】
    CSR；useAsyncData key 固定为 workspace-projects，删除成功后 refresh 列表。

  【边界与注意】
    删除流程委托 performWorkspaceProjectDelete，保证 loading 标记、刷新和通知在测试中可替换。
*/
import { message } from 'ant-design-vue'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { deleteWorkspaceProject, fetchWorkspaceProjects } from '~/api/workspace-project'
import type { WorkspaceProject } from '~/types/workspace-project'
import { performWorkspaceProjectDelete } from './workspace-project-delete'

type ProjectsResponse = Promise<{ data: { projects: WorkspaceProject[] } }>
type DeleteProjectResponse = Promise<unknown>

export type UseWorkspaceProjectsOptions = {
  fetchProjects?: () => ProjectsResponse
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

  const {
    data: projects,
    pending,
    error,
    refresh
  } = useAsyncData('workspace-projects', async () => {
    const response = await fetchProjects()
    return response.data.projects
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
    deleteProject
  }
}
