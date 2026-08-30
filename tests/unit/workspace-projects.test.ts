/*
  【文件职责】
    单测：工作台项目删除与分页加载动作。
    删除部分确保刷新列表并触发通知；分页部分确保 offset 推进正确且失败不清空已有列表。
*/
import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { performWorkspaceProjectDelete } from '../../app/features/workspace/composables/workspace-project-delete'
import { performWorkspaceProjectLoadMore } from '../../app/features/workspace/composables/workspace-project-load-more'
import type {
  WorkspaceProject,
  WorkspaceProjectPagination
} from '../../app/types/workspace-project'
import {
  makeWorkspaceProject,
  workspaceProjectFixture,
  workspaceProjectPaginationFixture
} from '../fixtures/workspace'

describe('performWorkspaceProjectDelete', () => {
  it('deletes a project, refreshes the list, and notifies success', async () => {
    const removeProject = vi.fn().mockResolvedValue({ data: null })
    const refresh = vi.fn().mockResolvedValue(undefined)
    const notifyDeleteSuccess = vi.fn()
    const notifyDeleteError = vi.fn()
    const deletingProjectId = ref<string | null>(null)

    await performWorkspaceProjectDelete({
      projectId: workspaceProjectFixture.id,
      removeProject,
      refresh,
      deletingProjectId,
      notifyDeleteSuccess,
      notifyDeleteError
    })

    expect(removeProject).toHaveBeenCalledWith(workspaceProjectFixture.id)
    expect(refresh).toHaveBeenCalled()
    expect(notifyDeleteSuccess).toHaveBeenCalled()
    expect(notifyDeleteError).not.toHaveBeenCalled()
    expect(deletingProjectId.value).toBeNull()
  })

  it('notifies error when delete fails', async () => {
    const removeProject = vi.fn().mockRejectedValue(new Error('delete failed'))
    const refresh = vi.fn()
    const notifyDeleteSuccess = vi.fn()
    const notifyDeleteError = vi.fn()
    const deletingProjectId = ref<string | null>(null)

    await performWorkspaceProjectDelete({
      projectId: workspaceProjectFixture.id,
      removeProject,
      refresh,
      deletingProjectId,
      notifyDeleteSuccess,
      notifyDeleteError
    })

    expect(refresh).not.toHaveBeenCalled()
    expect(notifyDeleteSuccess).not.toHaveBeenCalled()
    expect(notifyDeleteError).toHaveBeenCalled()
    expect(deletingProjectId.value).toBeNull()
  })
})

describe('performWorkspaceProjectLoadMore', () => {
  const setup = (loaded: WorkspaceProject[]) => ({
    extraProjects: ref<WorkspaceProject[]>([]),
    pagination: ref<WorkspaceProjectPagination | null>(workspaceProjectPaginationFixture),
    loadingMore: ref(false),
    loadMoreError: ref<unknown>(null),
    loaded
  })

  it('requests the next page using the loaded count as offset and appends the result', async () => {
    const state = setup([makeWorkspaceProject('p1'), makeWorkspaceProject('p2')])
    const fetchProjects = vi.fn().mockResolvedValue({
      data: {
        projects: [makeWorkspaceProject('p3')],
        pagination: { total: 3, limit: 20, offset: 2, hasMore: false }
      }
    })

    await performWorkspaceProjectLoadMore({ ...state, pageSize: 20, hasMore: true, fetchProjects })

    expect(fetchProjects).toHaveBeenCalledWith({ limit: 20, offset: 2 })
    expect(state.extraProjects.value.map((project) => project.id)).toEqual(['p3'])
    expect(state.pagination.value?.hasMore).toBe(false)
    expect(state.loadingMore.value).toBe(false)
  })

  it('accumulates across successive pages instead of replacing them', async () => {
    const state = setup([makeWorkspaceProject('p1')])
    const fetchProjects = vi
      .fn()
      .mockResolvedValueOnce({
        data: {
          projects: [makeWorkspaceProject('p2')],
          pagination: { total: 3, limit: 1, offset: 1, hasMore: true }
        }
      })
      .mockResolvedValueOnce({
        data: {
          projects: [makeWorkspaceProject('p3')],
          pagination: { total: 3, limit: 1, offset: 2, hasMore: false }
        }
      })

    await performWorkspaceProjectLoadMore({ ...state, pageSize: 1, hasMore: true, fetchProjects })
    await performWorkspaceProjectLoadMore({
      ...state,
      loaded: [...state.loaded, ...state.extraProjects.value],
      pageSize: 1,
      hasMore: true,
      fetchProjects
    })

    expect(fetchProjects).toHaveBeenNthCalledWith(2, { limit: 1, offset: 2 })
    expect(state.extraProjects.value.map((project) => project.id)).toEqual(['p2', 'p3'])
  })

  it('does nothing when there is no further page', async () => {
    const state = setup([workspaceProjectFixture])
    const fetchProjects = vi.fn()

    await performWorkspaceProjectLoadMore({ ...state, pageSize: 20, hasMore: false, fetchProjects })

    expect(fetchProjects).not.toHaveBeenCalled()
  })

  it('ignores a second call while one is still in flight', async () => {
    const state = setup([workspaceProjectFixture])
    state.loadingMore.value = true
    const fetchProjects = vi.fn()

    await performWorkspaceProjectLoadMore({ ...state, pageSize: 20, hasMore: true, fetchProjects })

    expect(fetchProjects).not.toHaveBeenCalled()
  })

  it('keeps the already loaded projects when the request fails', async () => {
    const state = setup([workspaceProjectFixture])
    state.extraProjects.value = [makeWorkspaceProject('p2')]
    const fetchProjects = vi.fn().mockRejectedValue(new Error('network down'))

    await performWorkspaceProjectLoadMore({ ...state, pageSize: 20, hasMore: true, fetchProjects })

    expect(state.extraProjects.value.map((project) => project.id)).toEqual(['p2'])
    expect(state.loadMoreError.value).toBeInstanceOf(Error)
    expect(state.loadingMore.value).toBe(false)
  })
})
