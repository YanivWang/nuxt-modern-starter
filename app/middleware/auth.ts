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

export default defineNuxtRouteMiddleware(async (to) => {
  const { localePath } = useLocalePath()
  const { ensureSession, hasRole, can } = useAuth()
  const hasSession = await ensureSession()

  if (!hasSession) {
    return navigateTo(buildAuthLoginRedirect(localePath('/login'), to.fullPath))
  }

  const authMeta = typeof to.meta.auth === 'object' ? (to.meta.auth as AuthRouteMeta) : undefined

  if (!isAuthorized(authMeta, { hasRole, can })) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden'
    })
  }
})
