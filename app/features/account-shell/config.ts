export type AccountNavItem = {
  path: string
  labelKey: string
  icon: string
}

export const accountNavItems: AccountNavItem[] = [
  { path: '/account', labelKey: 'accountNav.settings', icon: 'UserOutlined' }
]
