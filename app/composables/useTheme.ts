/*
  【文件职责】
    主题 composable：读取 / 持久化 theme mode、解析 system 偏好、应用 document dataset 与 Ant Design token。
    onMounted 恢复 localStorage 偏好并监听 prefers-color-scheme 变化。

  【架构位置】
    共享层 — app/composables，被 app/app.vue ConfigProvider、ThemeSwitcher 消费。

  【主要导出 / 路由】
    useTheme — mode、resolvedMode、antdTheme、setThemeMode、toggleTheme

  【依赖关系】
    - 依赖：config/theme.ts、useThemeStore
    - 被引用：app/app.vue、ThemeSwitcher 组件

  【渲染 / 数据】
    SSR 默认 light；client onMounted 读 THEME_STORAGE_KEY 并应用 dataset.theme。

  【边界与注意】
    mode === 'system' 时随 OS 深色模式自动切换 resolvedMode。
*/
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
