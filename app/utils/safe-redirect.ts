const UNSAFE_REDIRECT_PATTERN = /^\/[/\\]|[:\\]/

export const isSafeRedirectPath = (path: string) =>
  path.startsWith('/') && !path.startsWith('//') && !UNSAFE_REDIRECT_PATTERN.test(path)

export const resolveSafeRedirectPath = (redirect: string | undefined, fallback: string) => {
  if (typeof redirect === 'string' && isSafeRedirectPath(redirect)) {
    return redirect
  }

  return fallback
}
