import {
  DEFAULT_THEME_MODE,
  THEME_STORAGE_KEY,
  type ResolvedThemeMode,
  type ThemeMode
} from '../../config/theme'

export const useThemeStore = defineStore('theme', () => {
  const mode = ref<ThemeMode>(DEFAULT_THEME_MODE)
  const resolvedMode = ref<ResolvedThemeMode>('light')

  const setMode = (nextMode: ThemeMode) => {
    mode.value = nextMode
  }

  const setResolvedMode = (nextMode: ResolvedThemeMode) => {
    resolvedMode.value = nextMode
  }

  const toggleTheme = () => {
    setMode(resolvedMode.value === 'dark' ? 'light' : 'dark')
  }

  return {
    mode,
    resolvedMode,
    setMode,
    setResolvedMode,
    toggleTheme,
    storageKey: THEME_STORAGE_KEY
  }
})
