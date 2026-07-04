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
