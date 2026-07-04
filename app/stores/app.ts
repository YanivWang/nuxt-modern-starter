export const useAppStore = defineStore('app', () => {
  const navigationOpen = ref(false)

  const openNavigation = () => {
    navigationOpen.value = true
  }

  const closeNavigation = () => {
    navigationOpen.value = false
  }

  return {
    navigationOpen,
    openNavigation,
    closeNavigation
  }
})
