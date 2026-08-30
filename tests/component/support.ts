/*
  【文件职责】
    组件测试共享装置：复用 Nuxt app 自身的 pinia、重置会话与语言、构造登录态。

  【架构位置】
    tests/component — 仅被 tests/component/*.test.ts 引用。

  【主要导出 / 路由】
    resetComponentTestState、signInTestUser；导入本模块即自动启用组件卸载

  【依赖关系】
    - 依赖：app/stores/auth.ts、app/utils/auth-session.ts、@vue/test-utils（enableAutoUnmount）
    - mock：无

  【渲染 / 数据】
    无

  【边界与注意】
    必须 setActivePinia(useNuxtApp().$pinia)：mountSuspended 挂在 Nuxt app 上，
    另建 createPinia() 会让测试写入的 store 与组件读取的 store 变成两个实例。
    同一文件内所有用例共用一个 Nuxt app，useAsyncData 按 key 缓存的数据会跨用例残留，
    因此必须 clearNuxtData()，否则第二个用例读到的是第一个用例的响应。

    仅 clearNuxtData() 还不够，必须同时自动卸载组件：useAsyncData 按 key 共享同一次执行，
    而 composable 常在处理器里写实例级 ref（如 useWorkspaceProjects 的 pagination）。
    上一个用例的组件若仍挂载，那次共享执行的副作用会落在它身上，
    新实例的 ref 便一直是初始值 —— 表现为「单独跑通过、连着跑失败」。
*/
import { afterEach } from 'vitest'
import { enableAutoUnmount } from '@vue/test-utils'
import { setActivePinia } from 'pinia'
import { useAuthStore } from '../../app/stores/auth'
import { useAuthSession } from '../../app/utils/auth-session'
import type { AuthUser } from '../../config/auth'

// 导入即注册：每个 spec 文件在自己的 afterEach 里卸载本用例挂载的组件
enableAutoUnmount(afterEach)

export const resetComponentTestState = async () => {
  setActivePinia(useNuxtApp().$pinia)
  // useAsyncData 的结果挂在 nuxtApp 上按 key 缓存，跨用例不会自动失效
  clearNuxtData()
  useAuthSession().clear()
  useAuthStore().reset()
  await useLanguageStore().chooseLanguage('zh-CN')
}

export const signInTestUser = (overrides: Partial<AuthUser> = {}) => {
  useAuthSession().write({ accessToken: 'access', refreshToken: 'refresh' })
  const authStore = useAuthStore()

  authStore.user = {
    id: 1,
    username: 'alice',
    avatar: null,
    nickname: null,
    roles: [],
    permissions: [],
    ...overrides
  }

  return authStore
}
