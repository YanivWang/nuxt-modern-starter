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

  const register = (payload: RegisterPayload) => registerApi(payload)

  const logout = async () => {
    try {
      if (accessToken.value) {
        await logoutApi(accessToken.value, refreshToken.value)
      }
    } finally {
      clearAttributionParams()
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
