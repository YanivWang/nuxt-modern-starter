/*
  【文件职责】
    从 config/theme-palette.json 生成 app/assets/styles/tokens 下的 _variables.scss 与 _dark.scss。
    色值的唯一来源是那份 JSON，SCSS 是它的产物，不应手改。

  【架构位置】
    scripts — 由 package.json 的 prebuild* 钩子在每次构建前执行。

  【主要导出 / 路由】
    无（可执行脚本）；写出 tokens/_variables.scss 与 tokens/_dark.scss。

  【依赖关系】
    - 依赖：config/theme-palette.json、prettier（复用仓库 .prettierrc 排版生成物）
    - 被引用：package.json 的 generate:theme 与各 prebuild 钩子

  【渲染 / 数据】
    构建期一次性执行；产物是纯 CSS 变量声明，不含逻辑。

  【边界与注意】
    生成物带「AUTO-GENERATED」标记：手改会在下次构建被覆盖。
    新增 token 要同时改 cssVarMap 与 theme-palette.json，只改一处会生成出引用不到的变量。
*/
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import prettier from 'prettier'

const __dirname = dirname(fileURLToPath(import.meta.url))
const tokensDir = join(__dirname, '../app/assets/styles/tokens')
const palette = JSON.parse(readFileSync(join(__dirname, '../config/theme-palette.json'), 'utf8'))
const prettierConfig = (await prettier.resolveConfig(join(__dirname, '../.prettierrc'))) ?? {}

const { colorPalettes, layoutTokens, radiusTokens, spacingTokens, typographyTokens, zIndexTokens } =
  palette

const cssVarMap = {
  colorPrimary: '--app-color-primary',
  colorPrimaryHover: '--app-color-primary-hover',
  colorPrimaryActive: '--app-color-primary-active',
  colorPrimarySubtle: '--app-color-primary-subtle',
  colorPrimaryBorder: '--app-color-primary-border',
  colorBrand: '--app-color-brand',
  colorBrandHover: '--app-color-brand-hover',
  colorBrandContrast: '--app-color-brand-contrast',
  colorBgBase: '--app-color-bg',
  colorBgElevated: '--app-color-elevated',
  colorBgCanvas: '--app-color-bg-canvas',
  colorSurface: '--app-color-surface',
  colorOverlay: '--app-color-overlay',
  colorTextBase: '--app-color-text',
  colorTextStrong: '--app-color-text-strong',
  colorTextMuted: '--app-color-muted',
  colorTextSubtle: '--app-color-subtle',
  colorBorder: '--app-color-border',
  colorBorderStrong: '--app-color-border-strong',
  colorFillSecondary: '--app-color-fill-secondary',
  colorFillTertiary: '--app-color-fill-tertiary',
  colorSuccess: '--app-color-success',
  colorSuccessSubtle: '--app-color-success-subtle',
  colorWarning: '--app-color-warning',
  colorWarningSubtle: '--app-color-warning-subtle',
  colorDanger: '--app-color-danger',
  colorDangerSubtle: '--app-color-danger-subtle',
  colorInfo: '--app-color-info',
  colorAvatarFallback: '--app-color-avatar-fallback',
  colorAvatarFallbackText: '--app-color-avatar-fallback-text',
  colorProjectAccentViolet: '--app-project-accent-violet',
  colorProjectAccentCyan: '--app-project-accent-cyan',
  colorProjectAccentRose: '--app-project-accent-rose'
}

const light = colorPalettes.light

const fontSansScssValue = typographyTokens.fontSans
  .split(', ')
  .map((font) => `  ${font}`)
  .join(',\n')

const formatScss = (source) => prettier.format(source, { ...prettierConfig, parser: 'scss' })

const variablesHeader = `/*
  【文件职责】
    Sass 设计 token 变量源（$color-*、$spacing-* 等），由 pnpm generate:theme 从 config/theme-palette.json 生成。

  【架构位置】
    共享层 — app/assets/styles/tokens，被 _root.scss / _dark.scss @use 消费。
*/
`

const darkHeader = `/*
  【文件职责】
    暗黑模式 --app-* CSS 变量覆盖，由 :root[data-theme='dark'] 选择器生效。

  【架构位置】
    共享层 — app/assets/styles/tokens，与 _root.scss 配对；由 tokens/index.scss @use。
*/
`

const variables = `${variablesHeader}// AUTO-GENERATED — 请勿手改。编辑 config/theme-palette.json 后运行 pnpm generate:theme

// Brand — interactive
$color-primary: ${light.colorPrimary};
$color-primary-hover: ${light.colorPrimaryHover};
$color-primary-active: ${light.colorPrimaryActive};
$color-primary-subtle: ${light.colorPrimarySubtle};
$color-primary-border: ${light.colorPrimaryBorder};

// Brand — identity
$color-brand: ${light.colorBrand};
$color-brand-hover: ${light.colorBrandHover};
$color-brand-contrast: ${light.colorBrandContrast};

// Surfaces
$color-bg: ${light.colorBgBase};
$color-elevated: ${light.colorBgElevated};
$color-bg-canvas: ${light.colorBgCanvas};
$color-surface: ${light.colorSurface};
$color-overlay: ${light.colorOverlay};

// Text
$color-text: ${light.colorTextBase};
$color-text-strong: ${light.colorTextStrong};
$color-muted: ${light.colorTextMuted};
$color-subtle: ${light.colorTextSubtle};

// Borders & fills
$color-border: ${light.colorBorder};
$color-border-strong: ${light.colorBorderStrong};
$color-fill-secondary: ${light.colorFillSecondary};
$color-fill-tertiary: ${light.colorFillTertiary};

// Semantic
$color-success: ${light.colorSuccess};
$color-success-subtle: ${light.colorSuccessSubtle};
$color-warning: ${light.colorWarning};
$color-warning-subtle: ${light.colorWarningSubtle};
$color-danger: ${light.colorDanger};
$color-danger-subtle: ${light.colorDangerSubtle};
$color-info: ${light.colorInfo};
$color-avatar-fallback: ${light.colorAvatarFallback};
$color-avatar-fallback-text: ${light.colorAvatarFallbackText};

// Project accents
$project-accent-violet: ${light.colorProjectAccentViolet};
$project-accent-cyan: ${light.colorProjectAccentCyan};
$project-accent-rose: ${light.colorProjectAccentRose};

// Layout
$container-max: ${layoutTokens.containerMax};
$container-padding: ${layoutTokens.containerPadding};
$content-max-prose: ${layoutTokens.contentMaxProse};
$content-max-compact: ${layoutTokens.contentMaxCompact};
$header-control-size: ${layoutTokens.headerControlSize};
$header-icon-size: ${layoutTokens.headerIconSize};
$header-nav-gap: ${layoutTokens.headerNavGap};
$header-utility-gap: ${layoutTokens.headerUtilityGap};
$header-actions-gap: ${layoutTokens.headerActionsGap};
$header-auth-gap: ${layoutTokens.headerAuthGap};
$auth-btn-radius: ${layoutTokens.authBtnRadius};
$auth-btn-padding-inline: ${layoutTokens.authBtnPaddingInline};
$header-blur: ${layoutTokens.headerBlur};
$theme-switch-width: ${layoutTokens.themeSwitchWidth};
$theme-switch-height: ${layoutTokens.themeSwitchHeight};
$theme-switch-padding: ${layoutTokens.themeSwitchPadding};
$theme-switch-thumb-size: ${layoutTokens.themeSwitchThumbSize};
$theme-switch-icon-size: ${layoutTokens.themeSwitchIconSize};
$lang-panel-min-width: ${layoutTokens.langPanelMinWidth};
$lang-panel-padding: ${layoutTokens.langPanelPadding};
$lang-item-height: ${layoutTokens.langItemHeight};
$lang-item-font-size: ${layoutTokens.langItemFontSize};
$product-sidebar-width: ${layoutTokens.productSidebarWidth};
$product-nav-radius: ${layoutTokens.productNavRadius};
$auth-sign-in-border-hover: ${light.authSignInBorderHover};
$header-bg-scrolled: ${light.headerBgScrolled};
$radius-lg: ${light.borderRadius}px;

// Typography
$font-sans:
${fontSansScssValue};
$text-xs: ${typographyTokens.textXs};
$text-sm: ${typographyTokens.textSm};
$text-base: ${typographyTokens.textBase};
$text-md: ${typographyTokens.textMd};
$text-lg: ${typographyTokens.textLg};
$text-xl: ${typographyTokens.textXl};
$text-2xl: ${typographyTokens.text2xl};
$text-3xl: ${typographyTokens.text3xl};
$leading-tight: ${typographyTokens.leadingTight};
$leading-normal: ${typographyTokens.leadingNormal};
$leading-relaxed: ${typographyTokens.leadingRelaxed};
$weight-medium: ${typographyTokens.weightMedium};
$weight-semibold: ${typographyTokens.weightSemibold};
$weight-bold: ${typographyTokens.weightBold};
$weight-extrabold: ${typographyTokens.weightExtrabold};

// Spacing
$spacing-xs: ${spacingTokens.xs};
$spacing-sm: ${spacingTokens.sm};
$spacing-md: ${spacingTokens.md};
$spacing-lg: ${spacingTokens.lg};
$spacing-xl: ${spacingTokens.xl};

// Radius
$radius-base: ${radiusTokens.base};
$radius-medium: ${radiusTokens.medium};
$radius-large: ${radiusTokens.large};
$radius-xl: ${radiusTokens.xl};

// Shadows
$shadow-base: ${light.boxShadow};
$shadow-brand: ${light.boxShadowBrand};
$shadow-primary: ${light.boxShadowPrimary};
$shadow-surface: ${light.boxShadowSurface};
$shadow-elevation-1: ${light.boxShadowElevation1};
$shadow-elevation-2: ${light.boxShadowElevation2};
$shadow-elevation-3: ${light.boxShadowElevation3};

// Transition
$transition-base: all 0.3s ease;
$transition-fast: all 0.15s ease;

// z-index
$z-index-base: ${zIndexTokens.base};
$z-index-dropdown: ${zIndexTokens.dropdown};
$z-index-sticky: ${zIndexTokens.sticky};
$z-index-fixed: ${zIndexTokens.fixed};
$z-index-modal: ${zIndexTokens.modal};
$z-index-popover: ${zIndexTokens.popover};
$z-index-tooltip: ${zIndexTokens.tooltip};
`

const darkColorLines = Object.entries(cssVarMap)
  .map(([key, cssVar]) => `  ${cssVar}: ${colorPalettes.dark[key]};`)
  .join('\n')

const dark = `:root[data-theme='dark'] {
  color-scheme: dark;

${darkColorLines}

  --app-gradient-hero: linear-gradient(
    180deg,
    var(--app-color-elevated) 0%,
    color-mix(in srgb, var(--app-color-primary) 10%, var(--app-color-bg)) 58%,
    var(--app-color-bg) 100%
  );
  --app-gradient-page-header:
    radial-gradient(circle at 16% 18%, var(--app-color-primary-a8), transparent 30%),
    radial-gradient(circle at 84% 8%, var(--app-color-primary-a10), transparent 28%),
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--app-color-elevated) 58%, transparent),
      transparent 82%
    );
  --app-gradient-panel:
    radial-gradient(circle at 12% 0%, var(--app-color-primary-a10), transparent 34%),
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--app-color-elevated) 88%, transparent),
      var(--app-color-bg)
    ),
    var(--app-color-elevated);
  --app-gradient-surface-card: linear-gradient(
    180deg,
    color-mix(in srgb, var(--app-color-elevated) 88%, transparent),
    var(--app-color-bg)
  );

  --app-shadow-brand: 0 18px 36px rgb(0 0 0 / 28%);
  --app-shadow-primary: 0 24px 56px var(--app-color-primary-a18);
  --app-shadow-surface: 0 16px 42px rgb(0 0 0 / 24%);
  --app-shadow-surface-hover: 0 24px 54px rgb(0 0 0 / 30%);
  --app-shadow-elevation-1: 0 1px 2px rgb(0 0 0 / 24%);
  --app-shadow-elevation-2: 0 2px 8px rgb(0 0 0 / 28%);
  --app-shadow-elevation-3: 0 8px 24px rgb(0 0 0 / 35%);

  --app-auth-sign-in-bg: transparent;
  --app-auth-sign-in-bg-hover: rgb(248 250 252 / 6%);
  --app-auth-sign-in-border: var(--app-color-border-strong);
  --app-auth-sign-in-border-hover: var(--app-color-subtle);
  --app-auth-sign-in-text: var(--app-color-text);
  --app-auth-sign-up-bg: var(--app-color-brand);
  --app-auth-sign-up-bg-hover: var(--app-color-brand-hover);
  --app-auth-sign-up-text: var(--app-color-brand-contrast);
  --app-header-bg-scrolled: rgb(15 23 42 / 80%);
  --app-header-border-scrolled: rgb(248 250 252 / 10%);
  --app-shadow-sm: var(--app-shadow-surface-hover);
  --app-shadow-dropdown: 0 8px 20px rgb(0 0 0 / 35%);
  --app-home-cta-bg: var(--app-color-elevated);
  --app-home-cta-border: 1px solid var(--app-color-border);
  --app-home-cta-text: var(--app-color-text);
  --app-home-cta-shadow: none;
  --app-home-cta-btn-bg: var(--app-color-primary);
  --app-home-cta-btn-text: var(--app-color-brand-contrast);
  --app-home-cta-btn-border: transparent;
  --app-color-nav-hover-bg: color-mix(in srgb, var(--app-color-brand) 4%, transparent);
  --app-color-nav-active-bg: color-mix(in srgb, var(--app-color-primary) 10%, transparent);
  --app-color-surface-muted: color-mix(in srgb, var(--app-color-fill-secondary) 88%, transparent);
}
`

writeFileSync(join(tokensDir, '_variables.scss'), await formatScss(variables))
writeFileSync(
  join(tokensDir, '_dark.scss'),
  await formatScss(`${darkHeader}// AUTO-GENERATED — 请勿手改。编辑 config/theme-palette.json 后运行 pnpm generate:theme
// 暗黑模式 — 色值覆盖（渐变/阴影语义项见下方）

${dark}`)
)

console.log('Generated app/assets/styles/tokens/_variables.scss')
console.log('Generated app/assets/styles/tokens/_dark.scss')
