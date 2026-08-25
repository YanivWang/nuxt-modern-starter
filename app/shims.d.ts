/*
  【文件职责】
    全局类型 shim：允许 TypeScript 识别 *.css side-effect import（如 yaniv-editor styles），
    并为 useNuxtApp().$i18nContext 补充类型（由 app/plugins/i18n.ts 注入）。

  【架构位置】
    共享层 — app/shims.d.ts，编译期仅。

  【主要导出 / 路由】
    declare module '*.css'；declare module '#app' 的 NuxtApp.$i18nContext 增强

  【依赖关系】
    - 依赖：无
    - 被引用：EditorWorkspace 等 CSS import；usePageSeo / language store 读 $i18nContext

  【渲染 / 数据】
    无

  【边界与注意】
    新增非标准资源扩展名时在此补充 declare module。
*/
declare module '*.css'

// 为 useNuxtApp().$i18nContext 提供类型（由 app/plugins/i18n.ts 注入）
declare module '#app' {
  interface NuxtApp {
    $i18nContext: import('../i18n').AppI18nContext
  }
}

export {}
