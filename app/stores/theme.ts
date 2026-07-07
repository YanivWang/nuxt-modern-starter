/*
  【文件职责】
    主题模式 Pinia store：system / light / dark 偏好与 resolvedMode（实际渲染色板）。
    持久化键 THEME_STORAGE_KEY；resolved 计算与 document 应用由 useTheme composable 负责。

  【架构位置】
    共享层 — app/stores，被 useTheme composable、app/app.vue 消费。

  【主要导出 / 路由】
    useThemeStore — mode、resolvedMode、setMode、setResolvedMode、toggleTheme

  【依赖关系】
    - 依赖：config/theme.ts
    - 被引用：useTheme composable、ConfigProvider theme token

  【渲染 / 数据】
    client 读 localStorage；SSR 默认 resolvedMode = light。

  【边界与注意】
    store 仅持状态；DOM dataset.theme 与 Ant Design token 映射在 useTheme 中完成。
*/
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
