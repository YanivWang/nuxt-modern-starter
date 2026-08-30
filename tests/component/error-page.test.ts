// @vitest-environment nuxt
/*
  【文件职责】
    组件测试：app/error.vue 的状态码文案映射与 noindex 约束。

  【架构位置】
    tests/component — mountSuspended 真实挂载，需 Nuxt 运行时。

  【主要导出 / 路由】
    describe error page

  【依赖关系】
    - 依赖：app/error.vue、i18n error.*
    - mock：clearError

  【渲染 / 数据】
    客户端挂载；statusMessage 为 i18n key 时优先翻译，否则按 statusCode 回退。

  【边界与注意】
    error.forbidden 是 app/middleware/auth.ts 抛 403 时传入的 key，必须能被翻译出来。
*/
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import ErrorPage from '../../app/error.vue'
import { resetComponentTestState } from './support'

const { clearErrorMock } = vi.hoisted(() => ({ clearErrorMock: vi.fn() }))
mockNuxtImport('clearError', () => clearErrorMock)

const mountError = (error: Record<string, unknown>) =>
  mountSuspended(ErrorPage, { props: { error } })

describe('error page', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    await resetComponentTestState()
  })

  it('renders the status code and a translated title for 404', async () => {
    const wrapper = await mountError({ statusCode: 404 })

    expect(wrapper.get('.page-eyebrow').text()).toBe('404')
    expect(wrapper.get('.page-title').text().length).toBeGreaterThan(0)
  })

  it('translates the error.forbidden key raised by the auth middleware', async () => {
    const forbidden = await mountError({ statusCode: 403, statusMessage: 'error.forbidden' })
    const fallback = await mountError({ statusCode: 403 })

    // statusMessage 命中 i18n key 时走翻译，且与纯 403 回退文案一致
    expect(forbidden.get('.page-title').text()).toBe(fallback.get('.page-title').text())
    expect(forbidden.get('.page-title').text()).not.toBe('error.forbidden')
  })

  it('falls back to 500 in the eyebrow when no status code is given', async () => {
    const wrapper = await mountError({})

    expect(wrapper.get('.page-eyebrow').text()).toBe('500')
  })

  it('clears the error back to the home route', async () => {
    const wrapper = await mountError({ statusCode: 404 })

    await wrapper.get('.page-back-link').trigger('click')

    expect(clearErrorMock).toHaveBeenCalledWith({ redirect: '/' })
  })
})
