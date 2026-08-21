/*
  【文件职责】
    鉴权 composable：暴露 authStore action 与 ensureSession 会话恢复、RBAC helper。
    ensureSession 按 accessToken → fetchMe → 仅 401 时 refresh → fetchMe 恢复登录态。

  【架构位置】
    共享层 — app/composables，被 app/middleware/auth.ts、页面与 feature 组件消费。

  【主要导出 / 路由】
    useAuth — ensureSession、login、register、logout、can、hasRole、isAuthenticated

  【依赖关系】
    - 依赖：app/stores/auth.ts、config/auth.ts（Role、Permission 类型）
    - 被引用：app/middleware/auth.ts、app/plugins/auth.ts、sign-in / account 页面

  【渲染 / 数据】
    ensureSession 仅把明确 401 视为失效会话；临时网络/服务端错误向上抛出且保留 token。

  【边界与注意】
    can / hasRole 直接委托 store；logout 不跳转，与 auth store 一致。
*/
import type { Permission, Role } from '../../config/auth'
import { isUnauthorizedError } from '../lib/http/error'

export const useAuth = () => {
  const authStore = useAuthStore()

  /**
   * 恢复登录态：供 app/middleware/auth.ts 与页面初始化调用。
   * isAuthenticated 要求 accessToken 与 user 同时存在，仅有 cookie 无 user 时会走下方恢复链。
   */
  const ensureSession = async () => {
    if (authStore.isAuthenticated) {
      return true
    }

    // 有 accessToken 时先 /me；只有明确 401 才进入 refresh，其他故障不能销毁会话。
    if (authStore.accessToken) {
      try {
        await authStore.fetchMe()
        return true
      } catch (error) {
        if (!isUnauthorizedError(error)) {
          throw error
        }
      }
    }

    // 无 refreshToken 则无法续期，清空残留 cookie 并视为未登录
    if (!authStore.refreshToken) {
      authStore.reset()
      return false
    }

    try {
      await authStore.refresh()
      await authStore.fetchMe()
      return true
    } catch (error) {
      if (isUnauthorizedError(error)) {
        authStore.reset()
        return false
      }

      throw error
    }
  }

  // RBAC 直接委托 auth store，角色/权限数据来自 fetchMe 响应
  const can = (permission: Permission) => authStore.hasPermission(permission)
  const hasRole = (role: Role) => authStore.hasRole(role)

  return {
    authStore,
    user: computed(() => authStore.user),
    status: computed(() => authStore.status),
    isAuthenticated: computed(() => authStore.isAuthenticated),
    login: authStore.login,
    register: authStore.register,
    // logout 仅清 session，跳转由调用方（如 AccountPage）在 await 后执行
    logout: authStore.logout,
    ensureSession,
    can,
    hasRole
  }
}
