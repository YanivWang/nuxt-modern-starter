/*
  【文件职责】
    应用启动鉴权 bootstrap：有 token 时调用 ensureSession 恢复 session 与用户信息。
    无 token 时直接标记 unauthenticated，不发起 API 请求。

  【架构位置】
    共享层 — app/plugins，universal，在页面渲染前执行。

  【主要导出 / 路由】
    default export（defineNuxtPlugin）

  【依赖关系】
    - 依赖：useAuth composable、auth store
    - 被引用：Nuxt 自动注册

  【渲染 / 数据】
    universal — SSR 首请求与 CSR 均执行；ensureSession 可能触发 /me 与 refresh。

  【边界与注意】
    不在此 plugin 做路由跳转；401 / 未登录由 app/middleware/auth.ts 处理。
*/
export default defineNuxtPlugin(async () => {
  const { authStore, ensureSession } = useAuth()

  if (!authStore.accessToken && !authStore.refreshToken) {
    authStore.status = 'unauthenticated'
    return
  }

  await ensureSession()
})
