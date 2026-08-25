/*
  【文件职责】
    主题 composable：读取 / 持久化 theme mode、解析 system 偏好、应用 document dataset 与 Ant Design token。
    onMounted 恢复 localStorage 偏好并监听 prefers-color-scheme 变化。

  【架构位置】
    共享层 — app/composables，被 app/app.vue ConfigProvider、ThemeSwitch 消费。

  【主要导出 / 路由】
    useTheme — mode、resolvedMode、antdTheme、setThemeMode、toggleTheme

  【依赖关系】
    - 依赖：config/theme.ts、useThemeStore
    - 被引用：app/app.vue、app/components/layout/ThemeSwitch.vue、
      app/features/editor/components/EditorWorkspace.vue（按 resolvedMode 同步编辑器色板）

  【渲染 / 数据】
    SSR 默认 light；client onMounted 读 THEME_STORAGE_KEY 并应用 dataset.theme。

  【边界与注意】
    mode === 'system' 时随 OS 深色模式自动切换 resolvedMode。
*/
import {
  applyThemeCssVariables,
  getAntdThemeToken,
  THEME_STORAGE_KEY,
  type ResolvedThemeMode,
  type ThemeMode
} from '../../config/theme'

/** SSR 无 window，system 模式在服务端固定解析为 light */
const resolveSystemMode = (): ResolvedThemeMode => {
  if (!import.meta.client) {
    return 'light'
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/** 将 resolved 主题写入 <html data-theme> 并同步 CSS 变量 */
const applyDocumentTheme = (mode: ResolvedThemeMode) => {
  if (import.meta.client) {
    document.documentElement.dataset.theme = mode
    applyThemeCssVariables(mode)
  }
}

export const useTheme = () => {
  const store = useThemeStore()

  const resolvedMode = computed(() => store.resolvedMode)
  const antdTheme = computed(() => ({
    token: getAntdThemeToken(resolvedMode.value)
  }))

  // system 模式解析为 OS 偏好，light/dark 直接使用字面量
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

  // 按当前 resolved 色板切换，写入显式 light/dark（不再保持 system）
  const toggleTheme = () => {
    setThemeMode(resolvedMode.value === 'dark' ? 'light' : 'dark')
  }

  onMounted(() => {
    // client 首屏从 localStorage 恢复用户偏好，覆盖 store 初始值
    const savedMode = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null
    const initialMode = savedMode || store.mode
    setThemeMode(initialMode)

    // mode === 'system' 时监听 OS 深色偏好变化，仅更新 resolvedMode 与 DOM
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

  // SSR 首屏固定 light，避免 hydration 与 client 恢复后的主题不一致
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
