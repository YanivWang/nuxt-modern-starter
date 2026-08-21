/*
  【文件职责】
    鉴权 Pinia store：user / status 状态与 login / register / logout / refresh / fetchMe 业务 action。
    register 仅调 API 不自动登录；logout 清 session 但不跳转（UI 层 router.push）。

  【架构位置】
    登录产品区 — app/stores，被 useAuth composable、app/plugins/auth.client.ts 消费。

  【主要导出 / 路由】
    useAuthStore — login、register、logout、fetchMe、refresh、hasRole、hasPermission

  【依赖关系】
    - 依赖：app/api/auth.ts、app/utils/auth-session.ts、app/utils/attribution-params.ts、config/auth.ts
    - 被引用：useAuth、app/middleware/auth.ts、AccountPage、UserAccountMenu

  【渲染 / 数据】
    store state 只有 user 与 status，两者在 SSR 阶段恒为 null / 'idle'
    （鉴权 bootstrap 是 app/plugins/auth.client.ts，只跑在客户端）。
    令牌由 app/utils/auth-session.ts 持有，不进入 state —— setup store 返回的 ref 会被
    @pinia/nuxt 写进 nuxtApp.payload.pinia，也就是 SSR HTML，缓存路由会因此把令牌发给其他访客。

  【边界与注意】
    logout() 只清 token / user / 归因，不 router.push；AccountPage、UserAccountMenu 在 await logout() 后跳转。
    register 不写令牌、不 fetchMe。修改 action 需同步 tests/unit/auth-store.test.ts。
    新增 state 前先确认它对匿名访客可见也无害：state 会进入 SSR payload，见 tests/unit/ssr-payload-safety.test.ts。
*/
import {
  loginApi,
  logoutApi,
  normalizeAuthUser,
  refreshApi,
  registerApi,
  fetchMeApi,
  type LoginPayload,
  type RegisterPayload,
  type TokenResponse
} from '~/api/auth'
import { useAuthSession } from '../utils/auth-session'
import { clearAttributionParams } from '../utils/attribution-params'
import { createApiError, isUnauthorizedError } from '../lib/http/error'
import type { AuthUser, Permission, Role } from '../../config/auth'

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'refreshing'

export const useAuthStore = defineStore('auth', () => {
  const session = useAuthSession()
  const user = ref<AuthUser | null>(null)
  const status = ref<AuthStatus>('idle')

  // 须令牌与 user 同时存在；仅有 cookie 无 user 时 middleware 会走 ensureSession。
  // session.accessToken 是响应式 ref：api 层 refresh 失败清除令牌后，这里立即翻转。
  const isAuthenticated = computed(() => Boolean(session.accessToken.value && user.value))
  const hasRole = (role: Role) => Boolean(user.value?.roles.includes(role))
  const hasPermission = (permission: Permission) =>
    Boolean(user.value?.permissions.includes(permission))

  const setTokens = (response: TokenResponse) => {
    session.write(response.data)
  }

  const reset = () => {
    user.value = null
    session.clear()
    status.value = 'unauthenticated'
  }

  const fetchMe = async () => {
    if (!session.accessToken.value) {
      status.value = 'unauthenticated'
      throw createApiError({
        statusCode: 401,
        message: 'Missing access token'
      })
    }

    const response = await fetchMeApi(session.accessToken.value)
    user.value = normalizeAuthUser(response.data.user)
    status.value = 'authenticated'
    return user.value
  }

  const refresh = async () => {
    if (!session.refreshToken.value) {
      reset()
      return false
    }

    status.value = 'refreshing'

    try {
      const response = await refreshApi(session.refreshToken.value)
      setTokens(response)
      status.value = user.value ? 'authenticated' : 'idle'
      return true
    } catch (error) {
      if (isUnauthorizedError(error)) {
        reset()
      } else {
        // 临时网络/服务端错误不能销毁仍可能有效的 refresh token。
        status.value = user.value ? 'authenticated' : 'idle'
      }
      throw error
    }
  }

  const login = async (payload: LoginPayload) => {
    status.value = 'loading'

    try {
      const response = await loginApi(payload)
      setTokens(response)
      await fetchMe()
      return user.value
    } catch (error) {
      // 登录与用户初始化是一个原子动作；任一步失败都不能遗留 loading 或半会话。
      reset()
      throw error
    }
  }

  // register 仅调 API，不写令牌 / 不 fetchMe；登录由 sign-in 页 login 完成
  const register = (payload: RegisterPayload) => registerApi(payload)

  const logout = async () => {
    try {
      if (session.accessToken.value) {
        await logoutApi(session.accessToken.value, session.refreshToken.value)
      }
    } finally {
      clearAttributionParams()
      // 清 session 不跳转；UI 层负责 router.push(localePath('/'))
      reset()
    }
  }

  return {
    user,
    status,
    isAuthenticated,
    hasRole,
    hasPermission,
    setTokens,
    reset,
    fetchMe,
    refresh,
    login,
    register,
    logout
  }
})
