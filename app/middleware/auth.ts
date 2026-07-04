import type { AuthRouteMeta } from '../../config/auth'

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
  const roleAllowed = authMeta?.roles?.length
    ? authMeta.roles.some((role) => helpers.hasRole(role))
    : true
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
  const { localePath } = useLocalePath()
  const { ensureSession, hasRole, can } = useAuth()
  const hasSession = await ensureSession()
  const authMeta = typeof to.meta.auth === 'object' ? (to.meta.auth as AuthRouteMeta) : undefined
  const decision = resolveAuthMiddlewareDecision(
    hasSession,
    localePath('/login'),
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

  if (decision.type === 'error') {
    throw createError({
      statusCode: decision.statusCode,
      statusMessage: decision.statusMessage
    })
  }
})
