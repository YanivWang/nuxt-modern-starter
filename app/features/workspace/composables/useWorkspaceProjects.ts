/*
  【文件职责】
    工作台项目列表：拉取、删除、loading/error 状态与删除中标记。

  【架构位置】
    登录产品区 — app/features/workspace/composables，被 WorkspaceDashboard 消费。
*/
import { message } from 'ant-design-vue'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { deleteWorkspaceProject, fetchWorkspaceProjects } from '../api'
import type { WorkspaceProject } from '../types'
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
