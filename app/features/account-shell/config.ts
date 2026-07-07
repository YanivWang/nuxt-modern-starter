/*
  【文件职责】
    账户区侧栏导航单一来源：当前仅 /account 设置项。

  【架构位置】
    登录产品区 — app/features/account-shell config，AccountShell 渲染。

  【主要导出 / 路由】
    accountNavItems → /account

  【依赖关系】
    - 依赖：i18n accountNav.*
    - 被引用：AccountShell.vue

  【渲染 / 数据】
    无 — 静态配置。

  【边界与注意】
    扩展账户子页时在此追加 path；入口仍在 UserAccountMenu，不在 product-shell。
*/
export type AccountNavItem = {
  path: string
  labelKey: string
  icon: string
}

export const accountNavItems: AccountNavItem[] = [
  { path: '/account', labelKey: 'accountNav.settings', icon: 'UserOutlined' }
]
