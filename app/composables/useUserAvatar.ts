export const useUserAvatar = () => {
  const { authStore } = useAuth()

  const displayName = computed(() => authStore.user?.nickname || authStore.user?.username || '')

  const avatarUrl = computed(() => authStore.user?.avatar || null)

  const initials = computed(() => {
    const name = displayName.value.trim()
    if (!name) {
      return '?'
    }

    return name.charAt(0).toUpperCase()
  })

  return {
    displayName,
    avatarUrl,
    initials
  }
}
