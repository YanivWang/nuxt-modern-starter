/*
  【文件职责】
    产品区侧边栏导航单一来源：主 nav（工作台、模板）与 footer nav（定价外链）。
    path 为语言中性产品 URL 或公开页 path（定价经 localePath 展开）。

  【架构位置】
    登录产品区 — app/features/product-shell config，被 ProductShell 渲染。

  【主要导出 / 路由】
    productNavItems → /workspace、/workspace/templates
    productFooterNavItems → /pricing（公开 SEO 页，localePath 加 /en 前缀）

  【依赖关系】
    - 依赖：i18n productNav.* labelKey
    - 被引用：ProductShell.vue、tests/unit/product-shell.test.ts

  【渲染 / 数据】
    无 — 静态配置；图标名映射在 ProductShell navIconMap。

  【边界与注意】
    账户入口不在侧栏，在 UserAccountMenu；/account 走 account-shell。
    新增 workspace 子路由时在此追加 path，勿创建 /en/workspace 链接。
*/
export type ProductNavItem = {
  path: string
  labelKey: string
  icon: string
}

export const productNavItems: ProductNavItem[] = [
  { path: '/workspace', labelKey: 'productNav.workspace', icon: 'FolderOutlined' },
  { path: '/workspace/templates', labelKey: 'productNav.themeTemplates', icon: 'LayoutOutlined' }
]

export const productFooterNavItems: ProductNavItem[] = [
  { path: '/pricing', labelKey: 'productNav.pricing', icon: 'TagOutlined' }
]
