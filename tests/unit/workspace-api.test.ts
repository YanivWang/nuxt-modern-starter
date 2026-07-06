import { describe, expect, it, vi } from 'vitest'

const request = vi.fn()

vi.mock('../../app/api/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../app/api/auth')>()
  return {
    ...actual,
    createProductApiClient: vi.fn(() => ({ request }))
  }
})

describe('workspace api', () => {
  it('lists workspace projects', async () => {
    const { fetchWorkspaceProjects } = await import('../../app/features/workspace/api')

    await fetchWorkspaceProjects()

    expect(request).toHaveBeenCalledWith('/projects', { method: 'GET' })
  })

  it('creates workspace projects', async () => {
    const { createWorkspaceProject } = await import('../../app/features/workspace/api')

    await createWorkspaceProject({ title: 'Demo' })

    expect(request).toHaveBeenCalledWith('/projects', {
      method: 'POST',
      body: { title: 'Demo' }
    })
  })

  it('builds editor links from project ids', async () => {
    const { getWorkspaceDocPath, getWorkspaceNewDocPath, isNewWorkspaceProjectId } =
      await import('../../app/features/workspace/api')

    expect(getWorkspaceDocPath('proj_1')).toBe('/docs/proj_1')
    expect(getWorkspaceNewDocPath()).toBe('/docs/new')
    expect(isNewWorkspaceProjectId('new')).toBe(true)
  })
})
