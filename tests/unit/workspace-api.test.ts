/*
  【文件职责】
    单测：workspace api adapter 相对路径与 HTTP method（/projects CRUD）。

  【架构位置】
    tests/unit — mock createProductApiClient。

  【主要导出 / 路由】
    describe workspace api

  【依赖关系】
    - 依赖：app/api/workspace-project.ts
    - mock：createProductApiClient → { request }

  【渲染 / 数据】
    无

  【边界与注意】
    不覆盖 401 refresh；不测响应 envelope 解析。
*/
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
  it('lists workspace projects with default paging query', async () => {
    const { fetchWorkspaceProjects } = await import('../../app/api/workspace-project')

    await fetchWorkspaceProjects()

    expect(request).toHaveBeenCalledWith('/projects', { method: 'GET', query: {} })
  })

  it('forwards limit and offset to the list endpoint', async () => {
    const { fetchWorkspaceProjects } = await import('../../app/api/workspace-project')

    await fetchWorkspaceProjects({ limit: 20, offset: 40 })

    expect(request).toHaveBeenCalledWith('/projects', {
      method: 'GET',
      query: { limit: 20, offset: 40 }
    })
  })

  it('creates workspace projects', async () => {
    const { createWorkspaceProject } = await import('../../app/api/workspace-project')

    await createWorkspaceProject({ title: 'Demo' })

    expect(request).toHaveBeenCalledWith('/projects', {
      method: 'POST',
      body: { title: 'Demo' }
    })
  })

  it('builds editor links from project ids', async () => {
    const { getWorkspaceDocPath, getWorkspaceNewDocPath, isNewWorkspaceProjectId } =
      await import('../../app/api/workspace-project')

    expect(getWorkspaceDocPath('proj_1')).toBe('/docs/proj_1')
    expect(getWorkspaceNewDocPath()).toBe('/docs/new')
    expect(isNewWorkspaceProjectId('new')).toBe(true)
  })
})
