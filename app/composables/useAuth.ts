/*
  【文件职责】
    鉴权 composable：暴露 authStore action 与 ensureSession 会话恢复、RBAC helper。
    ensureSession 按 accessToken → fetchMe → refresh → fetchMe 顺序尝试恢复登录态。

  【架构位置】
    共享层 — app/composables，被 app/middleware/auth.ts、页面与 feature 组件消费。

  【主要导出 / 路由】
    useAuth — ensureSession、login、register、logout、can、hasRole、isAuthenticated

  【依赖关系】
    - 依赖：app/stores/auth.ts、config/auth.ts（Role、Permission 类型）
    - 被引用：app/middleware/auth.ts、app/plugins/auth.ts、sign-in / account 页面

  【渲染 / 数据】
    ensureSession 可能触发 /me 与 refresh API；失败时 reset 并返回 false。

  【边界与注意】
    can / hasRole 直接委托 store；logout 不跳转，与 auth store 一致。
*/
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
        // access token 可能过期，继续尝试 refresh
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
