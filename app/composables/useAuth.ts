import type { Permission, Role } from '../../config/auth'

export const useAuth = () => {
  const authStore = useAuthStore()

  const ensureSession = async () => {
    if (authStore.isAuthenticated) {
      return true
    }

    if (authStore.accessToken) {
      try {
        await authStore.fetchMe()
        return true
      } catch {
        // Access token may have expired; try refresh token below.
      }
    }

    if (!authStore.refreshToken) {
      authStore.reset()
      return false
    }

    try {
      await authStore.refresh()
      await authStore.fetchMe()
      return true
    } catch {
      authStore.reset()
      return false
    }
  }

  const can = (permission: Permission) => authStore.hasPermission(permission)
  const hasRole = (role: Role) => authStore.hasRole(role)

  return {
    authStore,
    user: computed(() => authStore.user),
    status: computed(() => authStore.status),
    isAuthenticated: computed(() => authStore.isAuthenticated),
    login: authStore.login,
    register: authStore.register,
    logout: authStore.logout,
    ensureSession,
    can,
    hasRole
  }
}
