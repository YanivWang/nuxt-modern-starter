/*
  【文件职责】
    Design Token 运行时 API：CSS 变量名常量、getCssVar / setCssVar。
    与 tokens/_root.scss、tokens/_dark.scss 中的 --app-* 命名对齐。

  【架构位置】
    共享层 — app/assets/styles，供 TS/图表/Canvas 等运行时读取主题变量。

  【依赖关系】
    - 依赖：无
    - 被引用：需要 JS 侧读取 CSS 变量的 composable / 组件
*/
import type { ResolvedThemeMode } from '../../../config/theme'

/** CSS 自定义属性名（与 tokens/_root.scss 对齐） */
export const cssVarTokens = {
  color: {
    primary: '--app-color-primary',
    primaryHover: '--app-color-primary-hover',
    primaryActive: '--app-color-primary-active',
    primarySubtle: '--app-color-primary-subtle',
    primaryBorder: '--app-color-primary-border',
    brand: '--app-color-brand',
    brandHover: '--app-color-brand-hover',
    brandContrast: '--app-color-brand-contrast',
    bg: '--app-color-bg',
    elevated: '--app-color-elevated',
    surface: '--app-color-surface',
    overlay: '--app-color-overlay',
    text: '--app-color-text',
    textStrong: '--app-color-text-strong',
    muted: '--app-color-muted',
    subtle: '--app-color-subtle',
    border: '--app-color-border',
    borderStrong: '--app-color-border-strong',
    success: '--app-color-success',
    successSubtle: '--app-color-success-subtle',
    warning: '--app-color-warning',
    warningSubtle: '--app-color-warning-subtle',
    danger: '--app-color-danger',
    dangerSubtle: '--app-color-danger-subtle'
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
    sm: '--app-shadow-sm'
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
    headerBorderScrolled: '--app-header-border-scrolled'
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
  font: {
    sans: '--app-font-sans'
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

/** 当前 resolved 主题对应的 data-theme 属性值 */
export const themeDataAttribute = (mode: ResolvedThemeMode): ResolvedThemeMode => mode
