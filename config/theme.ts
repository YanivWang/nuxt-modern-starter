/*
  【文件职责】
    主题模式与 design tokens 单一来源：light / dark 色板、Ant Design Vue token 映射、localStorage 键。
    getAntdThemeToken 将 themeTokens 投影为 Ant Design ConfigProvider theme.token 形状。

  【架构位置】
    config 层 — 与 app/assets/styles/tokens/ 共同构成视觉体系；被 theme composable / plugin 消费。

  【主要导出 / 路由】
    ThemeMode、ResolvedThemeMode、DEFAULT_THEME_MODE、THEME_STORAGE_KEY、
    themeTokens、getAntdThemeToken

  【依赖关系】
    - 依赖：无
    - 被引用：app/app.config.ts、app/app.vue、theme store / composable

  【渲染 / 数据】
    无 — 客户端 theme store 读取 THEME_STORAGE_KEY 持久化用户偏好。

  【边界与注意】
    修改 token 值时需同步 app/assets/styles/tokens/_variables.scss 与 _dark.scss。
*/
export type ThemeMode = 'system' | 'light' | 'dark'
export type ResolvedThemeMode = 'light' | 'dark'

export type ThemeTokens = {
  colorPrimary: string
  colorPrimaryHover: string
  colorPrimaryActive: string
  colorPrimarySubtle: string
  colorPrimaryBorder: string
  colorBrand: string
  colorBrandHover: string
  colorBrandContrast: string
  colorBgBase: string
  colorBgElevated: string
  colorSurface: string
  colorTextBase: string
  colorTextStrong: string
  colorTextMuted: string
  colorTextSubtle: string
  colorBorder: string
  colorBorderStrong: string
  colorSuccess: string
  colorSuccessSubtle: string
  colorWarning: string
  colorWarningSubtle: string
  colorDanger: string
  colorDangerSubtle: string
  borderRadius: number
  fontFamily: string
  boxShadow: string
  boxShadowBrand: string
  boxShadowPrimary: string
  boxShadowSurface: string
}

export const DEFAULT_THEME_MODE: ThemeMode = 'system'

export const THEME_STORAGE_KEY = 'nuxt-modern-starter-theme'

export const themeTokens: Record<ResolvedThemeMode, ThemeTokens> = {
  light: {
    colorPrimary: '#1677ff',
    colorPrimaryHover: '#4096ff',
    colorPrimaryActive: '#0958d9',
    colorPrimarySubtle: '#eff6ff',
    colorPrimaryBorder: '#bfdbfe',
    colorBrand: '#0f172a',
    colorBrandHover: '#1e293b',
    colorBrandContrast: '#ffffff',
    colorBgBase: '#ffffff',
    colorBgElevated: '#f8fafc',
    colorSurface: '#ffffff',
    colorTextBase: '#1f2937',
    colorTextStrong: '#0f172a',
    colorTextMuted: '#64748b',
    colorTextSubtle: '#475569',
    colorBorder: '#e5e7eb',
    colorBorderStrong: '#e2e8f0',
    colorSuccess: '#10b981',
    colorSuccessSubtle: '#ecfdf5',
    colorWarning: '#f59e0b',
    colorWarningSubtle: '#fffbeb',
    colorDanger: '#ef4444',
    colorDangerSubtle: '#fef2f2',
    borderRadius: 16,
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    boxShadow: '0 18px 45px rgb(15 23 42 / 10%)',
    boxShadowBrand: '0 18px 36px rgb(15 23 42 / 18%)',
    boxShadowPrimary: '0 24px 56px rgb(22 119 255 / 20%)',
    boxShadowSurface: '0 16px 42px rgb(15 23 42 / 6%)'
  },
  dark: {
    colorPrimary: '#69b1ff',
    colorPrimaryHover: '#91caff',
    colorPrimaryActive: '#4096ff',
    colorPrimarySubtle: 'rgb(105 177 255 / 12%)',
    colorPrimaryBorder: 'rgb(105 177 255 / 24%)',
    colorBrand: '#f8fafc',
    colorBrandHover: '#e2e8f0',
    colorBrandContrast: '#0f172a',
    colorBgBase: '#0f172a',
    colorBgElevated: '#111c33',
    colorSurface: '#111c33',
    colorTextBase: '#f8fafc',
    colorTextStrong: '#ffffff',
    colorTextMuted: '#94a3b8',
    colorTextSubtle: '#64748b',
    colorBorder: '#26344d',
    colorBorderStrong: '#334155',
    colorSuccess: '#34d399',
    colorSuccessSubtle: 'rgb(52 211 153 / 12%)',
    colorWarning: '#fbbf24',
    colorWarningSubtle: 'rgb(251 191 36 / 12%)',
    colorDanger: '#f87171',
    colorDangerSubtle: 'rgb(248 113 113 / 12%)',
    borderRadius: 16,
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    boxShadow: '0 18px 45px rgb(0 0 0 / 30%)',
    boxShadowBrand: '0 18px 36px rgb(0 0 0 / 28%)',
    boxShadowPrimary: '0 24px 56px rgb(105 177 255 / 18%)',
    boxShadowSurface: '0 16px 42px rgb(0 0 0 / 24%)'
  }
}

export const getAntdThemeToken = (mode: ResolvedThemeMode) => {
  const token = themeTokens[mode]

  return {
    colorPrimary: token.colorPrimary,
    colorPrimaryHover: token.colorPrimaryHover,
    colorPrimaryActive: token.colorPrimaryActive,
    colorLink: token.colorPrimary,
    colorSuccess: token.colorSuccess,
    colorWarning: token.colorWarning,
    colorError: token.colorDanger,
    colorBgBase: token.colorBgBase,
    colorTextBase: token.colorTextBase,
    borderRadius: token.borderRadius,
    fontFamily: token.fontFamily
  }
}
