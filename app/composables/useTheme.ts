import {
  getAntdThemeToken,
  THEME_STORAGE_KEY,
  type ResolvedThemeMode,
  type ThemeMode
} from '../../config/theme'

const resolveSystemMode = (): ResolvedThemeMode => {
  if (!import.meta.client) {
    return 'light'
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const applyDocumentTheme = (mode: ResolvedThemeMode) => {
  if (import.meta.client) {
    document.documentElement.dataset.theme = mode
  }
}

export const useTheme = () => {
  const store = useThemeStore()

  const resolvedMode = computed(() => store.resolvedMode)
  const antdTheme = computed(() => ({
    token: getAntdThemeToken(resolvedMode.value)
  }))

  const resolveMode = (mode: ThemeMode) => (mode === 'system' ? resolveSystemMode() : mode)

  const setThemeMode = (mode: ThemeMode) => {
    store.setMode(mode)

    if (import.meta.client) {
      localStorage.setItem(THEME_STORAGE_KEY, mode)
    }

    const nextResolvedMode = resolveMode(mode)
    store.setResolvedMode(nextResolvedMode)
    applyDocumentTheme(nextResolvedMode)
  }

  const toggleTheme = () => {
    setThemeMode(resolvedMode.value === 'dark' ? 'light' : 'dark')
  }

  onMounted(() => {
    const savedMode = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null
    const initialMode = savedMode || store.mode
    setThemeMode(initialMode)

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemChange = () => {
      if (store.mode === 'system') {
        const nextResolvedMode = resolveSystemMode()
        store.setResolvedMode(nextResolvedMode)
        applyDocumentTheme(nextResolvedMode)
      }
    }

    mediaQuery.addEventListener('change', handleSystemChange)
    onBeforeUnmount(() => mediaQuery.removeEventListener('change', handleSystemChange))
  })

  if (import.meta.server) {
    store.setResolvedMode('light')
  }

  return {
    mode: computed(() => store.mode),
    resolvedMode,
    antdTheme,
    setThemeMode,
    toggleTheme
  }
}
