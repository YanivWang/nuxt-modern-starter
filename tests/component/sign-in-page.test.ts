// @vitest-environment nuxt
/*
  【文件职责】
    组件测试：登录页提交流程与 ?redirect= 的开放重定向防护。
    这是 app/utils/safe-redirect.ts 纯函数单测的运行时对照面 —— 单测证明函数会拒绝外部地址，
    本文件证明页面确实把 query 交给了它，而不是直接 push。

  【架构位置】
    tests/component — mountSuspended 真实挂载，需 Nuxt 运行时。

  【主要导出 / 路由】
    describe sign-in page

  【依赖关系】
    - 依赖：app/pages/[[language]]/sign-in.vue、app/stores/auth.ts
    - mock：~/api/auth（loginApi / fetchMeApi）

  【渲染 / 数据】
    SSR 页面，此处以 CSR 方式挂载；route 由 mountSuspended 的 route 选项提供。

  【边界与注意】
    登录成功后的默认目标是 /workspace；非法 redirect 必须回退到该默认值而非跳出站外。
*/
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { resetComponentTestState } from './support'

const loginApi = vi.fn()
const fetchMeApi = vi.fn()

vi.mock('~/api/auth', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../app/api/auth')>()),
  loginApi: (...args: unknown[]) => loginApi(...args),
  fetchMeApi: (...args: unknown[]) => fetchMeApi(...args)
}))

const importSignIn = async () => (await import('../../app/pages/[[language]]/sign-in.vue')).default

const submit = async (route: string) => {
  const wrapper = await mountSuspended(await importSignIn(), { route })
  const router = useRouter()
  const push = vi.spyOn(router, 'push').mockResolvedValue(undefined)

  await wrapper.get('input[autocomplete="username"]').setValue('alice')
  await wrapper.get('input[autocomplete="current-password"]').setValue('secret')
  await wrapper.get('form').trigger('submit')

  return { wrapper, push }
}

describe('sign-in page', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    await resetComponentTestState()
    loginApi.mockResolvedValue({
      code: 200,
      message: 'ok',
      data: { accessToken: 'access', refreshToken: 'refresh' }
    })
    fetchMeApi.mockResolvedValue({
      code: 200,
      message: 'ok',
      data: { user: { id: 1, username: 'alice', roles: [], permissions: [] } }
    })
  })

  it('prefills the username from the query string', async () => {
    const wrapper = await mountSuspended(await importSignIn(), {
      route: '/sign-in?username=bob'
    })

    expect(wrapper.get('input[autocomplete="username"]').element.value).toBe('bob')
  })

  it('signs in and lands on the workspace by default', async () => {
    const { push } = await submit('/sign-in')
    await vi.waitFor(() => expect(push).toHaveBeenCalled())

    expect(loginApi).toHaveBeenCalledWith({ username: 'alice', password: 'secret' })
    expect(useAuthStore().isAuthenticated).toBe(true)
    expect(push).toHaveBeenCalledWith('/workspace')
  })

  it('honours a safe in-site redirect target', async () => {
    const { push } = await submit('/sign-in?redirect=/workspace/templates')
    await vi.waitFor(() => expect(push).toHaveBeenCalled())

    expect(push).toHaveBeenCalledWith('/workspace/templates')
  })

  it('refuses an off-site redirect and falls back to the workspace', async () => {
    const { push } = await submit('/sign-in?redirect=https://evil.example.com/steal')
    await vi.waitFor(() => expect(push).toHaveBeenCalled())

    expect(push).toHaveBeenCalledWith('/workspace')
  })

  it('refuses a protocol-relative redirect', async () => {
    const { push } = await submit('/sign-in?redirect=//evil.example.com')
    await vi.waitFor(() => expect(push).toHaveBeenCalled())

    expect(push).toHaveBeenCalledWith('/workspace')
  })

  it('keeps the session empty and does not navigate when login fails', async () => {
    loginApi.mockRejectedValue(new Error('bad credentials'))
    const { push } = await submit('/sign-in')

    await vi.waitFor(() => expect(loginApi).toHaveBeenCalled())
    expect(useAuthStore().isAuthenticated).toBe(false)
    expect(push).not.toHaveBeenCalled()
  })
})
