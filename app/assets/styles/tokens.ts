/*
  【文件职责】
    Design Token 运行时 API：CSS 变量名常量、getCssVar / setCssVar。
    与 config/theme-palette.mjs、tokens/_root.scss 对齐。

  【架构位置】
    共享层 — app/assets/styles，供 TS/图表/Canvas 等运行时读取主题变量。
*/
import {
  applyThemeCssVariables,
  themeTokenCssVarMap,
  type ResolvedThemeMode
} from '../../../config/theme'

export { applyThemeCssVariables, themeTokenCssVarMap }

/** CSS 自定义属性名（与 tokens/_root.scss 对齐） */
export const cssVarTokens = {
  color: {
    primary: themeTokenCssVarMap.colorPrimary,
    primaryHover: themeTokenCssVarMap.colorPrimaryHover,
    primaryActive: themeTokenCssVarMap.colorPrimaryActive,
    primarySubtle: themeTokenCssVarMap.colorPrimarySubtle,
    primaryBorder: themeTokenCssVarMap.colorPrimaryBorder,
    brand: themeTokenCssVarMap.colorBrand,
    brandHover: themeTokenCssVarMap.colorBrandHover,
    brandContrast: themeTokenCssVarMap.colorBrandContrast,
    bg: themeTokenCssVarMap.colorBgBase,
    elevated: themeTokenCssVarMap.colorBgElevated,
    bgCanvas: themeTokenCssVarMap.colorBgCanvas,
    surface: themeTokenCssVarMap.colorSurface,
    overlay: themeTokenCssVarMap.colorOverlay,
    text: themeTokenCssVarMap.colorTextBase,
    textStrong: themeTokenCssVarMap.colorTextStrong,
    muted: themeTokenCssVarMap.colorTextMuted,
    subtle: themeTokenCssVarMap.colorTextSubtle,
    border: themeTokenCssVarMap.colorBorder,
    borderStrong: themeTokenCssVarMap.colorBorderStrong,
    fillSecondary: themeTokenCssVarMap.colorFillSecondary,
    fillTertiary: themeTokenCssVarMap.colorFillTertiary,
    success: themeTokenCssVarMap.colorSuccess,
    successSubtle: themeTokenCssVarMap.colorSuccessSubtle,
    warning: themeTokenCssVarMap.colorWarning,
    warningSubtle: themeTokenCssVarMap.colorWarningSubtle,
    danger: themeTokenCssVarMap.colorDanger,
    dangerSubtle: themeTokenCssVarMap.colorDangerSubtle,
    info: themeTokenCssVarMap.colorInfo,
    avatarFallback: themeTokenCssVarMap.colorAvatarFallback,
    avatarFallbackText: themeTokenCssVarMap.colorAvatarFallbackText,
    navHoverBg: '--app-color-nav-hover-bg',
    navActiveBg: '--app-color-nav-active-bg'
  },
  projectAccent: {
    violet: themeTokenCssVarMap.colorProjectAccentViolet,
    cyan: themeTokenCssVarMap.colorProjectAccentCyan,
    rose: themeTokenCssVarMap.colorProjectAccentRose
  },
  gradient: {
    brandAccent: '--app-gradient-brand-accent',
    accentLine: '--app-gradient-accent-line',
    hero: '--app-gradient-hero',
    homePage: '--app-gradient-home-page',
    heroGlow: '--app-gradient-hero-glow',
    pageHeader: '--app-gradient-page-header',
    panel: '--app-gradient-panel',
    surfaceCard: '--app-gradient-surface-card'
  },
  shadow: {
    brand: '--app-shadow-brand',
    primary: '--app-shadow-primary',
    surface: '--app-shadow-surface',
    surfaceHover: '--app-shadow-surface-hover',
    dropdown: '--app-shadow-dropdown',
    sm: '--app-shadow-sm',
    elevation1: '--app-shadow-elevation-1',
    elevation2: '--app-shadow-elevation-2',
    elevation3: '--app-shadow-elevation-3'
  },
  layout: {
    containerMax: '--app-container-max',
    containerPadding: '--app-container-padding',
    contentMaxProse: '--app-content-max-prose',
    contentMaxCompact: '--app-content-max-compact',
    headerControlSize: '--app-header-control-size',
    headerIconSize: '--app-header-icon-size',
    headerNavGap: '--app-header-nav-gap',
    headerUtilityGap: '--app-header-utility-gap',
    headerActionsGap: '--app-header-actions-gap',
    headerAuthGap: '--app-header-auth-gap',
    headerBlur: '--app-header-blur',
    headerBgScrolled: '--app-header-bg-scrolled',
    headerBorderScrolled: '--app-header-border-scrolled',
    productSidebarWidth: '--app-product-sidebar-width',
    productNavRadius: '--app-product-nav-radius'
  },
  typography: {
    xs: '--app-text-xs',
    sm: '--app-text-sm',
    base: '--app-text-base',
    md: '--app-text-md',
    lg: '--app-text-lg',
    xl: '--app-text-xl',
    '2xl': '--app-text-2xl',
    '3xl': '--app-text-3xl',
    leadingTight: '--app-leading-tight',
    leadingNormal: '--app-leading-normal',
    leadingRelaxed: '--app-leading-relaxed',
    weightMedium: '--app-weight-medium',
    weightSemibold: '--app-weight-semibold',
    weightBold: '--app-weight-bold',
    weightExtrabold: '--app-weight-extrabold',
    sans: '--app-font-sans'
  },
  spacing: {
    xs: '--app-spacing-xs',
    sm: '--app-spacing-sm',
    md: '--app-spacing-md',
    lg: '--app-spacing-lg',
    xl: '--app-spacing-xl'
  },
  radius: {
    base: '--app-radius-base',
    medium: '--app-radius-medium',
    large: '--app-radius-large',
    lg: '--app-radius-lg'
  },
  zIndex: {
    base: '--app-z-index-base',
    dropdown: '--app-z-index-dropdown',
    sticky: '--app-z-index-sticky',
    fixed: '--app-z-index-fixed',
    modal: '--app-z-index-modal',
    popover: '--app-z-index-popover',
    tooltip: '--app-z-index-tooltip'
  },
  focus: {
    ring: '--app-focus-ring'
  }
} as const

export type CssVarToken = (typeof cssVarTokens)[keyof typeof cssVarTokens]

/** 读取已计算后的 CSS 变量值（client only） */
export const getCssVar = (
  name: string,
  element: HTMLElement = document.documentElement
): string => {
  if (!import.meta.client) {
    return ''
  }

  return getComputedStyle(element).getPropertyValue(name).trim()
}

/** 运行时覆盖单个 CSS 变量（client only） */
export const setCssVar = (
  name: string,
  value: string,
  element: HTMLElement = document.documentElement
): void => {
  if (import.meta.client) {
    element.style.setProperty(name, value)
  }
}

/** 将 resolved 主题同步到 DOM（封装 config/theme API） */
export const syncThemeCssVariables = (mode: ResolvedThemeMode) => {
  applyThemeCssVariables(mode)
}
