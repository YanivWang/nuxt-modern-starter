/*
  【文件职责】
    工作台项目删除动作：API 调用、列表刷新、通知与 deleting 状态。

  【架构位置】
    登录产品区 — app/features/workspace/composables，被 useWorkspaceProjects 消费。
*/
import type { Ref } from 'vue'

export type PerformWorkspaceProjectDeleteOptions = {
  projectId: string
  removeProject: (projectId: string) => Promise<unknown>
  refresh: () => Promise<void>
  deletingProjectId: Ref<string | null>
  notifyDeleteSuccess: () => void
  notifyDeleteError: () => void
}

export const performWorkspaceProjectDelete = async ({
  projectId,
  removeProject,
  refresh,
  deletingProjectId,
  notifyDeleteSuccess,
  notifyDeleteError
}: PerformWorkspaceProjectDeleteOptions) => {
  deletingProjectId.value = projectId

  try {
    await removeProject(projectId)
    await refresh()
    notifyDeleteSuccess()
  } catch {
    notifyDeleteError()
  } finally {
    deletingProjectId.value = null
  }
}
