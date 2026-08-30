// @vitest-environment nuxt
/*
  【文件职责】
    组件测试：AppHeader 的登录态分支渲染。
    这是缓存安全不变量的运行时对照面 —— tests/unit/ssr-cache-safety.test.ts 用静态扫描保证
    「登录态 UI 必须包在 <ClientOnly> 内」，本文件则验证两个分支真的各自渲染出正确的 CTA。

  【架构位置】
    tests/component — mountSuspended 真实挂载，需 Nuxt 运行时，首行 pragma opt-in。

  【主要导出 / 路由】
    describe AppHeader

  【依赖关系】
    - 依赖：app/components/layout/AppHeader.vue、app/stores/auth.ts、app/utils/auth-session.ts
    - mock：无（用真实 store + 真实会话模块，只写入令牌与 user）

  【渲染 / 数据】
    客户端挂载；ClientOnly 在挂载后渲染真实分支。

  【边界与注意】
    未登录分支必须是真实链接（爬虫可见），不能是占位按钮。
*/
import { beforeEach, describe, expect, it } from 'vitest'
import { setActivePinia } from 'pinia'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import AppHeader from '../../app/components/layout/AppHeader.vue'
import { useAuthStore } from '../../app/stores/auth'
import { useAuthSession } from '../../app/utils/auth-session'
import { NAV_ITEMS } from '../../config/site'

const signIn = () => {
  useAuthSession().write({ accessToken: 'access', refreshToken: 'refresh' })
  useAuthStore().user = {
    id: 1,
    username: 'alice',
    avatar: null,
    nickname: null,
    roles: [],
    permissions: []
  }
}

describe('AppHeader', () => {
  beforeEach(async () => {
    // 必须复用 Nuxt app 自己的 pinia：mountSuspended 挂载在该 app 上，
    // 另建一个 createPinia() 会让测试写入的 store 与组件读取的 store 是两个实例。
    setActivePinia(useNuxtApp().$pinia)
    useAuthSession().clear()
    useAuthStore().reset()
    await useLanguageStore().chooseLanguage('zh-CN')
  })

  it('renders every primary nav entry from config/site NAV_ITEMS', async () => {
    const wrapper = await mountSuspended(AppHeader)
    const hrefs = wrapper.findAll('.app-nav a').map((link) => link.attributes('href'))

    expect(hrefs).toEqual(NAV_ITEMS.map((item) => item.path))
  })

  it('shows real sign-in and sign-up links to anonymous visitors', async () => {
    const wrapper = await mountSuspended(AppHeader)

    expect(wrapper.find('.app-header__sign-in').attributes('href')).toBe('/sign-in')
    expect(wrapper.find('.app-header__sign-up').attributes('href')).toBe('/sign-up')
    expect(wrapper.find('.app-header__workspace').exists()).toBe(false)
  })

  it('swaps in the workspace CTA once a session exists', async () => {
    signIn()
    const wrapper = await mountSuspended(AppHeader)

    expect(wrapper.find('.app-header__workspace').attributes('href')).toBe('/workspace')
    expect(wrapper.find('.app-header__sign-in').exists()).toBe(false)
  })

  it('keeps the workspace CTA language-neutral after switching UI locale', async () => {
    signIn()
    await useLanguageStore().chooseLanguage('en-US')
    const wrapper = await mountSuspended(AppHeader)

    // 产品 URL 语言中性：/workspace 不加 /en 前缀；公开导航则加
    expect(wrapper.find('.app-header__workspace').attributes('href')).toBe('/workspace')
    expect(wrapper.findAll('.app-nav a')[1]?.attributes('href')).toBe('/en/pricing')
  })
})
