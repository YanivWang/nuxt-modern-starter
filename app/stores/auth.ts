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
} from '../apis/auth'
import {
  ACCESS_TOKEN_MAX_AGE,
  AUTH_COOKIE_KEYS,
  REFRESH_TOKEN_MAX_AGE,
  type AuthUser,
  type Permission,
  type Role
} from '../../config/auth'

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'refreshing'

const tokenFromResponse = (response: TokenResponse) => response.accessToken || response.token || null

const cookieOptions = (maxAge: number) => ({
  maxAge,
  sameSite: 'lax' as const,
  path: '/'
})

export const useAuthStore = defineStore('auth', () => {
  const accessToken = useCookie<string | null>(
    AUTH_COOKIE_KEYS.accessToken,
    cookieOptions(ACCESS_TOKEN_MAX_AGE)
  )
  const refreshToken = useCookie<string | null>(
    AUTH_COOKIE_KEYS.refreshToken,
    cookieOptions(REFRESH_TOKEN_MAX_AGE)
  )
  const user = ref<AuthUser | null>(null)
  const status = ref<AuthStatus>('idle')

  const isAuthenticated = computed(() => Boolean(accessToken.value && user.value))
  const hasRole = (role: Role) => Boolean(user.value?.roles.includes(role))
  const hasPermission = (permission: Permission) => Boolean(user.value?.permissions.includes(permission))

  const setTokens = (response: TokenResponse) => {
    const nextAccessToken = tokenFromResponse(response)

    if (nextAccessToken) {
      accessToken.value = nextAccessToken
    }

    refreshToken.value = response.refreshToken
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
    user.value = normalizeAuthUser(response.user)
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
