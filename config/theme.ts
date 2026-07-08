/*
  【文件职责】
    主题模式与 design tokens：从 config/theme-palette.json 读取色板，映射 Ant Design Vue token，
    并提供运行时 CSS 变量同步 API。

  【架构位置】
    config 层 — 与 app/assets/styles/tokens/ 共同构成视觉体系。

  【边界与注意】
    色值唯一源为 config/theme-palette.json；改色后运行 pnpm generate:theme 生成 SCSS。
*/
import themePalette from './theme-palette.json'

const { colorPalettes, themeTokenCssVarMap } = themePalette

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
  colorBgCanvas: string
  colorSurface: string
  colorOverlay: string
  colorTextBase: string
  colorTextStrong: string
  colorTextMuted: string
  colorTextSubtle: string
  colorBorder: string
  colorBorderStrong: string
  colorFillSecondary: string
  colorFillTertiary: string
  colorSuccess: string
  colorSuccessSubtle: string
  colorWarning: string
  colorWarningSubtle: string
  colorDanger: string
  colorDangerSubtle: string
  colorInfo: string
  colorAvatarFallback: string
  colorAvatarFallbackText: string
  colorProjectAccentViolet: string
  colorProjectAccentCyan: string
  colorProjectAccentRose: string
  borderRadius: number
  fontFamily: string
  boxShadow: string
  boxShadowBrand: string
  boxShadowPrimary: string
  boxShadowSurface: string
  boxShadowElevation1: string
  boxShadowElevation2: string
  boxShadowElevation3: string
}

export const DEFAULT_THEME_MODE: ThemeMode = 'system'
export const THEME_STORAGE_KEY = 'nuxt-modern-starter-theme'

const toThemeTokens = (palette: Record<string, string | number>): ThemeTokens => ({
  colorPrimary: String(palette.colorPrimary),
  colorPrimaryHover: String(palette.colorPrimaryHover),
  colorPrimaryActive: String(palette.colorPrimaryActive),
  colorPrimarySubtle: String(palette.colorPrimarySubtle),
  colorPrimaryBorder: String(palette.colorPrimaryBorder),
  colorBrand: String(palette.colorBrand),
  colorBrandHover: String(palette.colorBrandHover),
  colorBrandContrast: String(palette.colorBrandContrast),
  colorBgBase: String(palette.colorBgBase),
  colorBgElevated: String(palette.colorBgElevated),
  colorBgCanvas: String(palette.colorBgCanvas),
  colorSurface: String(palette.colorSurface),
  colorOverlay: String(palette.colorOverlay),
  colorTextBase: String(palette.colorTextBase),
  colorTextStrong: String(palette.colorTextStrong),
  colorTextMuted: String(palette.colorTextMuted),
  colorTextSubtle: String(palette.colorTextSubtle),
  colorBorder: String(palette.colorBorder),
  colorBorderStrong: String(palette.colorBorderStrong),
  colorFillSecondary: String(palette.colorFillSecondary),
  colorFillTertiary: String(palette.colorFillTertiary),
  colorSuccess: String(palette.colorSuccess),
  colorSuccessSubtle: String(palette.colorSuccessSubtle),
  colorWarning: String(palette.colorWarning),
  colorWarningSubtle: String(palette.colorWarningSubtle),
  colorDanger: String(palette.colorDanger),
  colorDangerSubtle: String(palette.colorDangerSubtle),
  colorInfo: String(palette.colorInfo),
  colorAvatarFallback: String(palette.colorAvatarFallback),
  colorAvatarFallbackText: String(palette.colorAvatarFallbackText),
  colorProjectAccentViolet: String(palette.colorProjectAccentViolet),
  colorProjectAccentCyan: String(palette.colorProjectAccentCyan),
  colorProjectAccentRose: String(palette.colorProjectAccentRose),
  borderRadius: Number(palette.borderRadius),
  fontFamily: String(palette.fontFamily),
  boxShadow: String(palette.boxShadow),
  boxShadowBrand: String(palette.boxShadowBrand),
  boxShadowPrimary: String(palette.boxShadowPrimary),
  boxShadowSurface: String(palette.boxShadowSurface),
  boxShadowElevation1: String(palette.boxShadowElevation1),
  boxShadowElevation2: String(palette.boxShadowElevation2),
  boxShadowElevation3: String(palette.boxShadowElevation3)
})

export const themeTokens: Record<ResolvedThemeMode, ThemeTokens> = {
  light: toThemeTokens(colorPalettes.light),
  dark: toThemeTokens(colorPalettes.dark)
}

export const getAntdThemeToken = (mode: ResolvedThemeMode) => {
  const token = themeTokens[mode]

  return {
    colorPrimary: token.colorPrimary,
    colorPrimaryHover: token.colorPrimaryHover,
    colorPrimaryActive: token.colorPrimaryActive,
    colorLink: token.colorPrimary,
    colorInfo: token.colorInfo,
    colorSuccess: token.colorSuccess,
    colorWarning: token.colorWarning,
    colorError: token.colorDanger,
    colorBgBase: token.colorBgBase,
    colorBgContainer: token.colorSurface,
    colorBgElevated: token.colorBgElevated,
    colorBgLayout: token.colorBgCanvas,
    colorText: token.colorTextBase,
    colorTextBase: token.colorTextBase,
    colorTextSecondary: token.colorTextMuted,
    colorTextTertiary: token.colorTextSubtle,
    colorBorder: token.colorBorder,
    colorBorderSecondary: token.colorBorderStrong,
    colorFillSecondary: token.colorFillSecondary,
    colorFillTertiary: token.colorFillTertiary,
    borderRadius: token.borderRadius,
    fontFamily: token.fontFamily,
    boxShadow: token.boxShadow,
    boxShadowSecondary: token.boxShadowSurface
  }
}

/** 将 resolved 主题色板同步到 document CSS 变量（client only） */
export const applyThemeCssVariables = (
  mode: ResolvedThemeMode,
  element: HTMLElement = document.documentElement
) => {
  if (!import.meta.client) {
    return
  }

  const token = themeTokens[mode]

  for (const [key, cssVar] of Object.entries(themeTokenCssVarMap)) {
    const value = token[key as keyof ThemeTokens]
    if (typeof value === 'string') {
      element.style.setProperty(cssVar, value)
    }
  }
}

export { themeTokenCssVarMap }
