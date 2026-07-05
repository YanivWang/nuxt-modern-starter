export type ProductRouteMode = 'workspace' | 'edit' | 'preview' | 'editor' | 'account'

export type ProductRouteConfig = {
  path: string
  labelKey: string
  mode: ProductRouteMode
  nav?: boolean
  auth: {
    required: true
    roles?: readonly string[]
    permissions?: readonly string[]
  }
  seo: {
    noindex: true
  }
}

export type ProductNavItem = Pick<ProductRouteConfig, 'path' | 'labelKey' | 'mode'>

export const productRouteConfigs = [
  {
    path: '/app/workspace',
    labelKey: 'workspace.nav',
    mode: 'workspace',
    nav: true,
    auth: { required: true },
    seo: { noindex: true }
  },
  {
    path: '/app/workspace/:projectId/edit',
    labelKey: 'workspace.edit',
    mode: 'edit',
    auth: { required: true },
    seo: { noindex: true }
  },
  {
    path: '/app/workspace/:projectId/preview',
    labelKey: 'workspace.preview',
    mode: 'preview',
    auth: { required: true },
    seo: { noindex: true }
  },
  {
    path: '/app/editor',
    labelKey: 'editor.title',
    mode: 'editor',
    auth: { required: true },
    seo: { noindex: true }
  },
  {
    path: '/app/account',
    labelKey: 'auth.account.title',
    mode: 'account',
    nav: true,
    auth: { required: true },
    seo: { noindex: true }
  }
] as const satisfies readonly ProductRouteConfig[]

const isProductNavRoute = (
  route: (typeof productRouteConfigs)[number]
): route is (typeof productRouteConfigs)[number] & { nav: true } => 'nav' in route && route.nav

export const productNavItems = productRouteConfigs
  .filter(isProductNavRoute)
  .map(({ path, labelKey, mode }) => ({ path, labelKey, mode })) satisfies ProductNavItem[]

const pathToRegExp = (path: string) => new RegExp(`^${path.replace(/:[^/]+/g, '[^/]+')}$`)

export const getProductRouteConfig = (path: string) =>
  productRouteConfigs.find((route) => pathToRegExp(route.path).test(path)) ?? null
