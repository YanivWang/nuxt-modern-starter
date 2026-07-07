/*
  【文件职责】
    用户头像展示 composable：从 authStore.user 派生 displayName、avatarUrl、首字母 initials。
    无 avatar 时 UI 可回退显示 initials。

  【架构位置】
    登录产品区 — app/composables，被 UserAccountMenu、AccountPage 消费。

  【主要导出 / 路由】
    useUserAvatar — displayName、avatarUrl、initials

  【依赖关系】
    - 依赖：useAuth composable
    - 被引用：UserAccountMenu、账户相关 UI

  【渲染 / 数据】
    无 — 纯 computed 派生；未登录时 displayName 为空、initials 为 ?。

  【边界与注意】
    nickname 优先于 username 作为 displayName。
*/
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
