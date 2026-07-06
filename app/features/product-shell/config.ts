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
