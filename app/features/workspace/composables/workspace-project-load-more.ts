/*
  【文件职责】
    工作台项目「加载更多」动作：按已加载条数请求下一页、累积结果、维护 loading 与错误状态。

  【架构位置】
    登录产品区 — app/features/workspace/composables，被 useWorkspaceProjects 消费。

  【主要导出 / 路由】
    performWorkspaceProjectLoadMore、PerformWorkspaceProjectLoadMoreOptions

  【依赖关系】
    - 依赖：~/types/workspace-project
    - 被引用：useWorkspaceProjects.ts、tests/unit/workspace-projects.test.ts

  【渲染 / 数据】
    无 — 纯动作函数，状态通过传入的 ref 驱动。

  【边界与注意】
    与 useAsyncData 解耦，便于在无 Nuxt 运行时的单测中直接验证分页推进逻辑。
    失败时保留已展示的列表，只记录错误供调用方提示重试。
*/
import type { Ref } from 'vue'
import type { WorkspaceProject, WorkspaceProjectPagination } from '~/types/workspace-project'

export type PerformWorkspaceProjectLoadMoreOptions = {
  /** 当前已展示的全部项目，其长度即下一页的 offset */
  loaded: readonly WorkspaceProject[]
  pageSize: number
  hasMore: boolean
  fetchProjects: (query: { limit: number; offset: number }) => Promise<{
    data: { projects: WorkspaceProject[]; pagination: WorkspaceProjectPagination }
  }>
  extraProjects: Ref<WorkspaceProject[]>
  pagination: Ref<WorkspaceProjectPagination | null>
  loadingMore: Ref<boolean>
  loadMoreError: Ref<unknown>
}

export const performWorkspaceProjectLoadMore = async ({
  loaded,
  pageSize,
  hasMore,
  fetchProjects,
  extraProjects,
  pagination,
  loadingMore,
  loadMoreError
}: PerformWorkspaceProjectLoadMoreOptions) => {
  // 没有下一页，或上一次请求尚未结束时直接返回，避免重复追加同一页
  if (!hasMore || loadingMore.value) return

  loadingMore.value = true
  loadMoreError.value = null

  try {
    // offset 取已加载条数而非页码乘以页长——删除会让两者不一致
    const response = await fetchProjects({ limit: pageSize, offset: loaded.length })
    extraProjects.value = [...extraProjects.value, ...response.data.projects]
    pagination.value = response.data.pagination
  } catch (caught) {
    // 加载失败不清空已展示的列表，只记录错误供调用方提示重试
    loadMoreError.value = caught
  } finally {
    loadingMore.value = false
  }
}
