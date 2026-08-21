/*
  【文件职责】
    应用启动鉴权 bootstrap：有令牌时调用 ensureSession 恢复 session 与用户信息。
    无令牌时直接标记 unauthenticated，不发起 API 请求。

  【架构位置】
    共享层 — app/plugins，仅客户端（.client 后缀），在页面 hydration 前执行。

  【主要导出 / 路由】
    default export（defineNuxtPlugin）

  【依赖关系】
    - 依赖：useAuth composable、app/utils/auth-session.ts
    - 被引用：Nuxt 自动注册

  【渲染 / 数据】
    client-only —— 这是缓存安全的前提：公开路由存在 prerender 与 SWR 缓存，
    而 Nitro 的缓存键只按 path、不区分 cookie。若在 SSR 阶段恢复登录态，
    某个登录用户渲染出的 HTML（含其 user 信息）会被缓存并发给其他访客。
    产品区路由本身就是 ssr: false（见 config/routes.ts 的 csrRouteRules），
    服务端从不需要登录态，因此 client-only 不损失任何能力。

  【边界与注意】
    不在此 plugin 做路由跳转；401 / 未登录由 app/middleware/auth.ts 处理。
    公开页启动遇到临时 API 故障时保留令牌，由受保护路由 middleware 再向上暴露错误。
    依赖登录态的 UI 必须包在 <ClientOnly> 内，否则 SSR 输出与 hydration 结果不一致。
*/
import { useAuthSession } from '../utils/auth-session'

export default defineNuxtPlugin(async () => {
  const { authStore, ensureSession } = useAuth()
  const session = useAuthSession()

  // 无任何令牌 cookie 时直接标记未登录，跳过 /me 与 refresh 请求
  if (!session.accessToken.value && !session.refreshToken.value) {
    authStore.status = 'unauthenticated'
    return
  }

  // 启动恢复不能让页面因鉴权 API 临时故障整体报错，也不能清除仍可能有效的令牌。
  try {
    await ensureSession()
  } catch {
    authStore.status = 'idle'
  }
})
