// @vitest-environment nuxt
/*
  【文件职责】
    组件测试：WorkspaceDashboard 的加载 / 空态 / 列表 / 错误四种渲染分支与创建入口。

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
*/
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { workspaceProjectFixture } from '../fixtures/workspace'
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

describe('WorkspaceDashboard', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    await resetComponentTestState()
  })

  it('renders the empty state when the workspace has no projects', async () => {
    fetchWorkspaceProjects.mockResolvedValue({ data: { projects: [] } })
    const wrapper = await mountSuspended(await importDashboard())

    expect(wrapper.find('.workspace-grid').exists()).toBe(false)
    expect(wrapper.find('.workspace-empty').exists()).toBe(true)
  })

  it('renders one card per project', async () => {
    fetchWorkspaceProjects.mockResolvedValue({
      data: {
        projects: [
          workspaceProjectFixture,
          { ...workspaceProjectFixture, id: 'project_2', title: 'Roadmap' }
        ]
      }
    })
    const wrapper = await mountSuspended(await importDashboard())
    const cards = wrapper.findAll('.workspace-card')

    expect(cards).toHaveLength(2)
    expect(wrapper.text()).toContain('Roadmap')
    expect(wrapper.find('.workspace-card__title').attributes('href')).toBe('/docs/project_1')
  })

  it('surfaces a retryable alert when the list request fails', async () => {
    fetchWorkspaceProjects.mockRejectedValue(new Error('boom'))
    const wrapper = await mountSuspended(await importDashboard())

    expect(wrapper.find('.workspace-error').exists()).toBe(true)
    expect(wrapper.find('.workspace-grid').exists()).toBe(false)
  })

  it('navigates to the draft editor route from the single create entry', async () => {
    fetchWorkspaceProjects.mockResolvedValue({ data: { projects: [] } })
    const wrapper = await mountSuspended(await importDashboard())

    await wrapper.get('.workspace-dashboard__header button').trigger('click')

    expect(navigateToMock).toHaveBeenCalledWith('/docs/new')
  })
})
