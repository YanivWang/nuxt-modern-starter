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
})
