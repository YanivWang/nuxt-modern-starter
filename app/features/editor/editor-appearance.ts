/*
  【文件职责】
    将 app design token（--app-*）映射为 YanivEditor customAppearanceVars（--ye-*）。
    使用 CSS var 引用，主题切换时编辑器自动跟随。

  【架构位置】
    登录产品区 — app/features/editor，EditorWorkspace 消费。
*/
// 与 --app-z-index-dropdown 对齐；浮层层级由 zIndexBase → --ye-z-base 派生（见 yaniv-editor z-index 文档）
export const EDITOR_Z_INDEX_BASE = 1000

/**
 * CSS var 链式引用 --app-*，主题切换时 YanivEditor 自动跟随站点色板。
 *
 * 只映射库真正读取的变量。设一个库里不存在的名字不会报错、也不会有任何效果 ——
 * 升级编辑器时若某个变量被改名，这里就会静默失效，表现为「某块颜色忽然不跟主题了」。
 * tests/unit/editor-appearance.test.ts 拿已安装的库 CSS 逐条核对，堵住这条静默路径。
 */
export const editorCustomAppearanceVars: Record<string, string> = {
  '--ye-primary': 'var(--app-color-primary)',
  '--ye-primary-hover': 'var(--app-color-primary-hover)',
  '--ye-primary-light': 'var(--app-color-primary-subtle)',
  // 纸面(--ye-bg) 与画布(--ye-bg-secondary) 必须分层，否则文档区与背景糊成一片
  '--ye-bg': 'var(--app-color-bg)',
  '--ye-bg-hover': 'var(--app-color-fill-secondary)',
  '--ye-bg-secondary': 'var(--app-color-fill-secondary)',
  '--ye-bg-tertiary': 'var(--app-color-fill-tertiary)',
  '--ye-text': 'var(--app-color-text)',
  '--ye-text-secondary': 'var(--app-color-muted)',
  '--ye-text-muted': 'var(--app-color-subtle)',
  '--ye-border': 'var(--app-color-border)',
  '--ye-border-hover': 'var(--app-color-border-strong)',
  '--ye-link': 'var(--app-color-primary)',
  '--ye-link-hover': 'var(--app-color-primary-hover)',
  '--ye-danger': 'var(--app-color-danger)',
  '--ye-danger-bg': 'var(--app-color-danger-subtle)',
  '--ye-toolbar-bg': 'var(--app-color-bg)',
  '--ye-toolbar-border': 'var(--app-color-border)',
  '--ye-toolbar-btn-hover': 'var(--app-color-nav-hover-bg)',
  '--ye-toolbar-btn-active': 'var(--app-color-nav-active-bg)',
  '--ye-toolbar-btn-text': 'var(--app-color-text)',
  '--ye-toolbar-btn-disabled': 'var(--app-color-subtle)',
  '--ye-toolbar-divider': 'var(--app-color-border)',
  '--ye-toolbar-dropdown-shadow': 'var(--app-shadow-dropdown)',
  '--ye-bubble-bg': 'var(--app-color-bg)',
  '--ye-bubble-shadow': 'var(--app-shadow-dropdown)',
  '--ye-code-bg': 'var(--app-color-fill-secondary)',
  '--ye-code-text': 'var(--app-color-text)',
  '--ye-codeblock-bg': 'var(--app-color-fill-secondary)',
  '--ye-codeblock-text': 'var(--app-color-text)',
  '--ye-blockquote-bg': 'var(--app-color-fill-secondary)',
  '--ye-blockquote-border': 'var(--app-color-primary-border)',
  '--ye-selection': 'var(--app-color-primary-subtle)',
  '--ye-caret': 'var(--app-color-primary)',
  '--ye-placeholder-color': 'var(--app-color-subtle)',
  '--ye-font-family': 'var(--app-font-sans)',
  '--ye-font-size': 'var(--app-text-md)',
  '--ye-line-height': 'var(--app-leading-relaxed)',
  '--ye-radius-sm': 'var(--app-radius-base)',
  '--ye-radius-md': 'var(--app-radius-medium)',
  '--ye-radius-lg': 'var(--app-radius-large)',
  '--ye-shadow-md': 'var(--app-shadow-elevation-2)',

  // 0.3.0 新增的主题变量；不映射的话表格、分隔线、高亮、页脚会用库自带调色板，
  // 在站点主题下显得突兀（功能不受影响，纯观感一致性）。
  '--ye-table-border': 'var(--app-color-border)',
  '--ye-table-header-bg': 'var(--app-color-fill-secondary)',
  '--ye-table-selected-bg': 'var(--app-color-primary-subtle)',
  '--ye-code-inline-border': 'var(--app-color-border)',
  '--ye-hr-color': 'var(--app-color-border)',
  '--ye-mark-bg': 'var(--app-color-warning-subtle)',
  '--ye-footer-bg': 'var(--app-color-bg)',
  '--ye-footer-divider': 'var(--app-color-border)',
  '--ye-footer-text': 'var(--app-color-muted)',
  '--ye-outline-title-color': 'var(--app-color-text)'
}
