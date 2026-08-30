/*
  【文件职责】
    组件测试共享装置：复用 Nuxt app 自身的 pinia、重置会话与语言、构造登录态。

  【架构位置】
    tests/component — 仅被 tests/component/*.test.ts 引用。

  【主要导出 / 路由】
    resetComponentTestState、signInTestUser

  【依赖关系】
    - 依赖：app/stores/auth.ts、app/utils/auth-session.ts
    - mock：无

  【渲染 / 数据】
    无

  【边界与注意】
    必须 setActivePinia(useNuxtApp().$pinia)：mountSuspended 挂在 Nuxt app 上，
    另建 createPinia() 会让测试写入的 store 与组件读取的 store 变成两个实例。
    同一文件内所有用例共用一个 Nuxt app，useAsyncData 按 key 缓存的数据会跨用例残留，
    因此必须 clearNuxtData()，否则第二个用例读到的是第一个用例的响应。
*/
import { setActivePinia } from 'pinia'
import { useAuthStore } from '../../app/stores/auth'
import { useAuthSession } from '../../app/utils/auth-session'
import type { AuthUser } from '../../config/auth'

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
