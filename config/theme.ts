/*
  【文件职责】
    主题模式与 design tokens 单一来源：light / dark 色板、Ant Design Vue token 映射、localStorage 键。
    getAntdThemeToken 将 themeTokens 投影为 Ant Design ConfigProvider theme.token 形状。

  【架构位置】
    config 层 — 与 app/assets/styles/*.scss 共同构成视觉体系；被 theme composable / plugin 消费。

  【主要导出 / 路由】
    ThemeMode、ResolvedThemeMode、DEFAULT_THEME_MODE、THEME_STORAGE_KEY、
    themeTokens、getAntdThemeToken

  【依赖关系】
    - 依赖：无
    - 被引用：app/app.config.ts、app/app.vue、theme store / composable

  【渲染 / 数据】
    无 — 客户端 theme store 读取 THEME_STORAGE_KEY 持久化用户偏好。

  【边界与注意】
    修改 token 值时需检查 app/assets/styles 中是否有需同步的 CSS 变量或硬编码色值。
*/
export type ThemeMode = 'system' | 'light' | 'dark'
export type ResolvedThemeMode = 'light' | 'dark'

type ThemeTokens = {
  colorPrimary: string
  colorBgBase: string
  colorBgElevated: string
  colorTextBase: string
  colorTextMuted: string
  colorBorder: string
  borderRadius: number
  fontFamily: string
  boxShadow: string
}

export const DEFAULT_THEME_MODE: ThemeMode = 'system'

export const THEME_STORAGE_KEY = 'nuxt-modern-starter-theme'

export const themeTokens: Record<ResolvedThemeMode, ThemeTokens> = {
  light: {
    colorPrimary: '#1677ff',
    colorBgBase: '#ffffff',
    colorBgElevated: '#f8fafc',
    colorTextBase: '#1f2937',
    colorTextMuted: '#64748b',
    colorBorder: '#e5e7eb',
    borderRadius: 16,
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    boxShadow: '0 18px 45px rgb(15 23 42 / 10%)'
  },
  dark: {
    colorPrimary: '#69b1ff',
    colorBgBase: '#0f172a',
    colorBgElevated: '#111c33',
    colorTextBase: '#f8fafc',
    colorTextMuted: '#94a3b8',
    colorBorder: '#26344d',
    borderRadius: 16,
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    boxShadow: '0 18px 45px rgb(0 0 0 / 30%)'
  }
}

export const getAntdThemeToken = (mode: ResolvedThemeMode) => {
  const token = themeTokens[mode]

  return {
    colorPrimary: token.colorPrimary,
    colorBgBase: token.colorBgBase,
    colorTextBase: token.colorTextBase,
    borderRadius: token.borderRadius,
    fontFamily: token.fontFamily
  }
}
