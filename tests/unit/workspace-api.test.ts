import { describe, expect, it, vi } from 'vitest'

const apiMocks = vi.hoisted(() => ({
  request: vi.fn()
}))

vi.mock('../../app/apis/product/client', () => ({
  createProductApiClient: () => ({
    request: apiMocks.request
  })
}))

describe('workspace API boundary', () => {
  it('lists projects through the authenticated product request entrypoint', async () => {
    const { fetchWorkspaceProjects } = await import('../../app/features/workspace/api')

    fetchWorkspaceProjects()

    expect(apiMocks.request).toHaveBeenCalledWith('/projects', {
      method: 'GET'
    })
  })

  it('creates projects through the authenticated product request entrypoint', async () => {
    const { createWorkspaceProject } = await import('../../app/features/workspace/api')

    createWorkspaceProject({
      title: 'New deck',
      description: 'Customer narrative'
    })

    expect(apiMocks.request).toHaveBeenCalledWith('/projects', {
      method: 'POST',
      body: {
        title: 'New deck',
        description: 'Customer narrative'
      }
    })
  })

  it('reads projects through the authenticated product request entrypoint', async () => {
    const { fetchWorkspaceProject } = await import('../../app/features/workspace/api')

    fetchWorkspaceProject('project_1')

    expect(apiMocks.request).toHaveBeenCalledWith('/projects/project_1', {
      method: 'GET'
    })
  })

  it('deletes projects through the authenticated product request entrypoint', async () => {
    const { deleteWorkspaceProject } = await import('../../app/features/workspace/api')

    deleteWorkspaceProject('project_1')

    expect(apiMocks.request).toHaveBeenCalledWith('/projects/project_1', {
      method: 'DELETE'
    })
  })

  it('updates projects through the authenticated product request entrypoint', async () => {
    const { updateWorkspaceProject } = await import('../../app/features/workspace/api')

    updateWorkspaceProject('project_1', {
      title: 'Renamed deck'
    })

    expect(apiMocks.request).toHaveBeenCalledWith('/projects/project_1', {
      method: 'PATCH',
      body: {
        title: 'Renamed deck'
      }
    })
  })

  it('exposes the draft editor entry path', async () => {
    const {
      getWorkspaceDocPath,
      getWorkspaceNewDocPath,
      isNewWorkspaceProjectId,
      WORKSPACE_NEW_PROJECT_ID
    } = await import('../../app/features/workspace/api')

    expect(WORKSPACE_NEW_PROJECT_ID).toBe('new')
    expect(getWorkspaceNewDocPath()).toBe('/docs/new')
    expect(getWorkspaceDocPath('project_1')).toBe('/docs/project_1')
    expect(isNewWorkspaceProjectId('new')).toBe(true)
    expect(isNewWorkspaceProjectId('project_1')).toBe(false)
  })
})
