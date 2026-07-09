/*
  【文件职责】
    单测：工作台项目删除动作，确保删除后会刷新列表并触发通知。
*/
import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { performWorkspaceProjectDelete } from '../../app/features/workspace/composables/workspace-project-delete'
import { workspaceProjectFixture } from '../fixtures/workspace'

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
