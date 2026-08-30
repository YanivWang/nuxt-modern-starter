// @vitest-environment nuxt
/*
  【文件职责】
    组件测试：WorkspaceDashboard 的加载 / 空态 / 列表 / 错误四种渲染分支、分页「加载更多」与创建入口。

  【架构位置】
    tests/component — mountSuspended 真实挂载，需 Nuxt 运行时。

  【主要导出 / 路由】
    describe WorkspaceDashboard

  【依赖关系】
    - 依赖：app/features/workspace/components/WorkspaceDashboard.vue
    - mock：~/api/workspace-project（fetchWorkspaceProjects / deleteWorkspaceProject）、navigateTo

  【渲染 / 数据】
    CSR；useAsyncData('workspace-projects') 的数据来自 mock adapter。

  【边界与注意】
    创建入口只有顶部按钮，且必须导航到 /docs/new —— 无空白卡片入口，见 WorkspaceDashboard 头注释。
    mock 必须带 pagination：真实 adapter 一定返回它，而 hasMore 有 `?? false` 兜底，
    漏掉 pagination 的 mock 会让分页接线断掉也照样绿。
*/
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { workspaceProjectFixture } from '../fixtures/workspace'
import type {
  WorkspaceProject,
  WorkspaceProjectPagination
} from '../../app/types/workspace-project'
import { resetComponentTestState } from './support'

const fetchWorkspaceProjects = vi.fn()
const deleteWorkspaceProject = vi.fn()

vi.mock('~/api/workspace-project', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../app/api/workspace-project')>()),
  fetchWorkspaceProjects: (...args: unknown[]) => fetchWorkspaceProjects(...args),
  deleteWorkspaceProject: (...args: unknown[]) => deleteWorkspaceProject(...args)
}))

const { navigateToMock } = vi.hoisted(() => ({ navigateToMock: vi.fn() }))
mockNuxtImport('navigateTo', () => navigateToMock)

const importDashboard = async () =>
  (await import('../../app/features/workspace/components/WorkspaceDashboard.vue')).default

/** 按后端 shared/http/pagination 的形状构造响应；hasMore 由服务端算，这里显式给出 */
const listResponse = (
  projects: WorkspaceProject[],
  pagination: Partial<WorkspaceProjectPagination> = {}
) => ({
  data: {
    projects,
    pagination: {
      total: projects.length,
      limit: 20,
      offset: 0,
      hasMore: false,
      ...pagination
    }
  }
})

const makeProjects = (count: number, offset = 0) =>
  Array.from({ length: count }, (_, index) => ({
    ...workspaceProjectFixture,
    id: `project_${offset + index + 1}`,
    title: `Project ${offset + index + 1}`
  }))

describe('WorkspaceDashboard', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    await resetComponentTestState()
  })

  it('renders the empty state when the workspace has no projects', async () => {
    fetchWorkspaceProjects.mockResolvedValue(listResponse([]))
    const wrapper = await mountSuspended(await importDashboard())

    expect(wrapper.find('.workspace-grid').exists()).toBe(false)
    expect(wrapper.find('.workspace-empty').exists()).toBe(true)
  })

  it('renders one card per project', async () => {
    fetchWorkspaceProjects.mockResolvedValue(
      listResponse([
        workspaceProjectFixture,
        { ...workspaceProjectFixture, id: 'project_2', title: 'Roadmap' }
      ])
    )
    const wrapper = await mountSuspended(await importDashboard())
    const cards = wrapper.findAll('.workspace-card')

    expect(cards).toHaveLength(2)
    expect(wrapper.text()).toContain('Roadmap')
    expect(wrapper.find('.workspace-card__title').attributes('href')).toBe('/docs/project_1')
    // 首屏必须按服务端默认单页条数请求，而不是无参全量拉
    expect(fetchWorkspaceProjects).toHaveBeenCalledWith({ limit: 20, offset: 0 })
  })

  it('surfaces a retryable alert when the list request fails', async () => {
    fetchWorkspaceProjects.mockRejectedValue(new Error('boom'))
    const wrapper = await mountSuspended(await importDashboard())

    expect(wrapper.find('.workspace-error').exists()).toBe(true)
    expect(wrapper.find('.workspace-grid').exists()).toBe(false)
  })

  it('hides the load-more control when the first page covers everything', async () => {
    fetchWorkspaceProjects.mockResolvedValue(listResponse(makeProjects(2), { hasMore: false }))
    const wrapper = await mountSuspended(await importDashboard())

    expect(wrapper.find('.workspace-load-more').exists()).toBe(false)
  })

  it('appends the next page and drops the control once everything is loaded', async () => {
    // 按 offset 返回对应分片，而不是靠 mockResolvedValueOnce 的调用顺序 ——
    // 这样断言的是「组件用 offset 翻页」这件事本身，也不会被额外的重取打乱。
    fetchWorkspaceProjects.mockImplementation((query: { limit: number; offset: number }) =>
      Promise.resolve(
        query.offset === 0
          ? listResponse(makeProjects(20), { total: 25, hasMore: true })
          : listResponse(makeProjects(5, 20), { total: 25, offset: 20, hasMore: false })
      )
    )

    const wrapper = await mountSuspended(await importDashboard())
    expect(wrapper.findAll('.workspace-card')).toHaveLength(20)
    expect(wrapper.find('.workspace-load-more').exists()).toBe(true)

    await wrapper.get('.workspace-load-more button').trigger('click')
    await vi.waitFor(() => expect(wrapper.findAll('.workspace-card')).toHaveLength(25))

    // offset 必须按已加载条数推进，否则会重复拉第一页
    expect(fetchWorkspaceProjects).toHaveBeenLastCalledWith({ limit: 20, offset: 20 })
    expect(wrapper.find('.workspace-load-more').exists()).toBe(false)
  })

  it('navigates to the draft editor route from the single create entry', async () => {
    fetchWorkspaceProjects.mockResolvedValue(listResponse([]))
    const wrapper = await mountSuspended(await importDashboard())

    await wrapper.get('.workspace-dashboard__header button').trigger('click')

    expect(navigateToMock).toHaveBeenCalledWith('/docs/new')
  })
})
