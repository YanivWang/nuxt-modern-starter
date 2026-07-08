/*
  【文件职责】
    命名 auth 路由中间件：保护产品区路由，ensureSession 后校验登录态与 RBAC。
    resolveAuthMiddlewareDecision 集中处理未登录 redirect、403 forbidden、放行三种决策。

  【架构位置】
    登录产品区 — app/middleware，由 definePageMeta({ middleware: 'auth' }) 按需挂载。
    在 app/middleware/locale.global.ts 之后执行。

  【主要导出 / 路由】
    resolveAuthMiddlewareDecision、isAuthorized、buildAuthLoginRedirect、AuthMiddlewareDecision

  【依赖关系】
    - 依赖：config/auth.ts、config/routes.ts（localizedPath）、useAuth composable
    - 被引用：workspace、docs、account 等产品页；tests/unit/auth-middleware.test.ts

  【渲染 / 数据】
    命名 middleware，CSR 产品区导航时执行；ensureSession 可能触发 /me 或 refresh。

  【边界与注意】
    未登录 redirect 到 localizedPath('/sign-in')，query.redirect 保留原 fullPath。
    RBAC：roles 任一命中即可；permissions 须全部满足。403 用 error.forbidden。
    登录 redirect 安全校验在 sign-in 页 resolveSafeRedirectPath，不在此 middleware。
*/
import { AUTH_REDIRECTS, type AuthRouteMeta } from '../../config/auth'
import { localizedPath } from '../../config/routes'

/** 未登录时构造登录页跳转；redirect 保留原 fullPath（含 query / hash）供 sign-in 页回跳 */
export const buildAuthLoginRedirect = (loginPath: string, fullPath: string) => ({
  path: loginPath,
  query: {
    redirect: fullPath
  }
})

export const isAuthorized = (
  authMeta: AuthRouteMeta | undefined,
  helpers: {
    hasRole: (role: string) => boolean
    can: (permission: string) => boolean
  }
) => {
  // roles 任一命中即可；未配置 roles 时默认放行
  const roleAllowed = authMeta?.roles?.length
    ? authMeta.roles.some((role) => helpers.hasRole(role))
    : true
  // permissions 须全部满足；无 auth meta 时默认放行
  const permissionAllowed = authMeta?.permissions?.length
    ? authMeta.permissions.every((permission) => helpers.can(permission))
    : true

  return roleAllowed && permissionAllowed
}

export type AuthMiddlewareDecision =
  | {
      type: 'redirect'
      location: ReturnType<typeof buildAuthLoginRedirect>
    }
  | {
      type: 'error'
      statusCode: 403
      statusMessage: 'error.forbidden'
    }
  | {
      type: 'allow'
    }

/** 纯函数决策树：未登录 → redirect；已登录但 RBAC 不通过 → 403；否则放行 */
export const resolveAuthMiddlewareDecision = (
  hasSession: boolean,
  loginPath: string,
  fullPath: string,
  authMeta: AuthRouteMeta | undefined,
  helpers: {
    hasRole: (role: string) => boolean
    can: (permission: string) => boolean
  }
): AuthMiddlewareDecision => {
  if (!hasSession) {
    return {
      type: 'redirect',
      location: buildAuthLoginRedirect(loginPath, fullPath)
    }
  }

  if (!isAuthorized(authMeta, helpers)) {
    return {
      type: 'error',
      statusCode: 403,
      statusMessage: 'error.forbidden'
    }
  }

  return {
    type: 'allow'
  }
}

export default defineNuxtRouteMiddleware(async (to) => {
  const { ensureSession, hasRole, can } = useAuth()
  const languageStore = useLanguageStore()
  // ensureSession：有 token 则 fetchMe，401 时尝试 refresh 后再 fetchMe
  const hasSession = await ensureSession()
  // definePageMeta({ auth: { roles, permissions } }) 才参与 RBAC；非 object 视为无要求
  const authMeta = typeof to.meta.auth === 'object' ? (to.meta.auth as AuthRouteMeta) : undefined
  const decision = resolveAuthMiddlewareDecision(
    hasSession,
    localizedPath(AUTH_REDIRECTS.login, languageStore.currentLanguage),
    to.fullPath,
    authMeta,
    {
      hasRole,
      can
    }
  )

  if (decision.type === 'redirect') {
    return navigateTo(decision.location)
  }

  // 403 由 Nuxt error 页渲染；redirect query 安全校验在 sign-in 页 resolveSafeRedirectPath
  if (decision.type === 'error') {
    throw createError({
      statusCode: decision.statusCode,
      statusMessage: decision.statusMessage
    })
  }
})
