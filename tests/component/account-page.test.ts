// @vitest-environment nuxt
/*
  【文件职责】
    组件测试：AccountPage 的资料渲染、扩展字段展开与退出登录跳转分工。

  【架构位置】
    tests/component — mountSuspended 真实挂载，需 Nuxt 运行时。

  【主要导出 / 路由】
    describe AccountPage

  【依赖关系】
    - 依赖：app/features/account/components/AccountPage.vue、app/stores/auth.ts
    - mock：~/api/auth（fetchProfileApi / logoutApi）

  【渲染 / 数据】
    CSR；useAsyncData('auth-profile') 数据来自 mock adapter，无 token 时返回 null。

  【边界与注意】
    authStore.logout() 只清 session，跳转由本组件负责 —— 断言必须同时覆盖两侧。
*/
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { resetComponentTestState, signInTestUser } from './support'

const fetchProfileApi = vi.fn()
const logoutApi = vi.fn()

vi.mock('~/api/auth', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../app/api/auth')>()),
  fetchProfileApi: (...args: unknown[]) => fetchProfileApi(...args),
  logoutApi: (...args: unknown[]) => logoutApi(...args)
}))

const importAccountPage = async () =>
  (await import('../../app/features/account/components/AccountPage.vue')).default

describe('AccountPage', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    await resetComponentTestState()
    fetchProfileApi.mockResolvedValue({ data: { profile: null } })
    logoutApi.mockResolvedValue({ code: 200, message: 'ok', data: null })
  })

  it('renders username and falls back to a dash for a missing nickname', async () => {
    signInTestUser()
    const wrapper = await mountSuspended(await importAccountPage())
    const values = wrapper.findAll('.app-data-row__value').map((node) => node.text())

    expect(values).toContain('alice')
    expect(values).toContain('-')
  })

  it('shows avatar initials when the user has no avatar image', async () => {
    signInTestUser({ nickname: 'Alice Zhang' })
    const wrapper = await mountSuspended(await importAccountPage())

    expect(wrapper.get('.app-avatar-fallback').text()).toBe('A')
    expect(wrapper.find('.app-avatar-fallback img').exists()).toBe(false)
  })

  it('expands extended profile fields returned by the API', async () => {
    signInTestUser()
    fetchProfileApi.mockResolvedValue({ data: { profile: { company: 'Acme', plan: 'growth' } } })
    const wrapper = await mountSuspended(await importAccountPage())

    expect(fetchProfileApi).toHaveBeenCalledWith('access')
    expect(wrapper.text()).toContain('Acme')
    expect(wrapper.text()).toContain('growth')
  })

  it('clears the session and navigates home on logout', async () => {
    const authStore = signInTestUser()
    const wrapper = await mountSuspended(await importAccountPage())
    const router = useRouter()
    const push = vi.spyOn(router, 'push').mockResolvedValue(undefined)

    const logoutButton = wrapper
      .findAll('button')
      .find((button) => button.classes().some((name) => name.includes('logout')))

    expect(logoutButton, '账户页必须有退出登录按钮').toBeTruthy()
    await logoutButton!.trigger('click')
    await vi.waitFor(() => expect(push).toHaveBeenCalled())

    expect(logoutApi).toHaveBeenCalled()
    expect(authStore.isAuthenticated).toBe(false)
    expect(push).toHaveBeenCalledWith('/')
  })

  it('skips the profile request when there is no access token', async () => {
    const wrapper = await mountSuspended(await importAccountPage())

    expect(fetchProfileApi).not.toHaveBeenCalled()
    expect(wrapper.find('.account-settings__card').exists()).toBe(true)
  })
})
