export default defineNuxtPlugin(async () => {
  const { authStore, ensureSession } = useAuth()

  if (!authStore.accessToken && !authStore.refreshToken) {
    authStore.status = 'unauthenticated'
    return
  }

  await ensureSession()
})
