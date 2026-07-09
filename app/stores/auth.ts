/*
  【文件职责】
    鉴权 Pinia store：token cookie 绑定、user 状态、login / register / logout / refresh 业务 action。
    register 仅调 API 不自动登录；logout 清 session 但不跳转（UI 层 router.push）。

  【架构位置】
    登录产品区 — app/stores，被 useAuth composable、app/plugins/auth.ts 消费。

  【主要导出 / 路由】
    useAuthStore — login、register、logout、fetchMe、refresh、hasRole、hasPermission

  【依赖关系】
    - 依赖：app/api/auth.ts、app/utils/auth-session.ts、app/utils/attribution-params.ts、config/auth.ts
    - 被引用：useAuth、app/middleware/auth.ts、AccountPage、UserAccountMenu

  【渲染 / 数据】
    CSR 为主；token 存 useCookie，user 存 ref；status 驱动 UI loading 态。

  【边界与注意】
    logout() 只清 token / user / 归因，不 router.push；AccountPage、UserAccountMenu 在 await logout() 后跳转。
    register 不 setTokens、不 fetchMe。修改 action 需同步 tests/unit/auth-store.test.ts。
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
import { getAccessTokenCookie, getRefreshTokenCookie } from '../utils/auth-session'
import { clearAttributionParams } from '../utils/attribution-params'
import type { AuthUser, Permission, Role } from '../../config/auth'

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'refreshing'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = getAccessTokenCookie()
  const refreshToken = getRefreshTokenCookie()
  const user = ref<AuthUser | null>(null)
  const status = ref<AuthStatus>('idle')

  // 须 accessToken 与 user 同时存在；仅有 cookie 无 user 时 middleware 会走 ensureSession
  const isAuthenticated = computed(() => Boolean(accessToken.value && user.value))
  const hasRole = (role: Role) => Boolean(user.value?.roles.includes(role))
  const hasPermission = (permission: Permission) =>
    Boolean(user.value?.permissions.includes(permission))

  const setTokens = (response: TokenResponse) => {
    accessToken.value = response.data.accessToken
    refreshToken.value = response.data.refreshToken
  }

  const reset = () => {
    user.value = null
    accessToken.value = null
    refreshToken.value = null
    status.value = 'unauthenticated'
  }

  const fetchMe = async () => {
    if (!accessToken.value) {
      status.value = 'unauthenticated'
      throw createError({
        statusCode: 401,
        statusMessage: 'Missing access token'
      })
    }

    const response = await fetchMeApi(accessToken.value)
    user.value = normalizeAuthUser(response.data.user)
    status.value = 'authenticated'
    return user.value
  }

  const refresh = async () => {
    if (!refreshToken.value) {
      reset()
      return false
    }

    status.value = 'refreshing'

    try {
      const response = await refreshApi(refreshToken.value)
      setTokens(response)
      status.value = user.value ? 'authenticated' : 'idle'
      return true
    } catch (error) {
      reset()
      throw error
    }
  }

  const login = async (payload: LoginPayload) => {
    status.value = 'loading'
    const response = await loginApi(payload)
    setTokens(response)
    await fetchMe()
    return user.value
  }

  // register 仅调 API，不 setTokens / fetchMe；登录由 sign-in 页 login 完成
  const register = (payload: RegisterPayload) => registerApi(payload)

  const logout = async () => {
    try {
      if (accessToken.value) {
        await logoutApi(accessToken.value, refreshToken.value)
      }
    } finally {
      clearAttributionParams()
      // 清 session 不跳转；UI 层负责 router.push(localePath('/'))
      reset()
    }
  }

  return {
    accessToken,
    refreshToken,
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
