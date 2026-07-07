# Architecture

`nuxt-modern-starter` is organized as a reusable public-site and product-app foundation. Public SEO pages and logged-in product pages share Nuxt infrastructure, but they have separate route, rendering, data, and module boundaries. Pages stay thin: public pages compose content and SEO, while product pages mount feature modules under `app/features/*`.

## Directory Responsibilities

- `app/pages/[[language]]`: localized public route entries. Default language has no prefix, English public pages use `/en`. Current pages include home, pricing, about, help, news list/detail, sign-in, sign-up, and the catch-all 404 handler.
- `app/pages/workspace`: logged-in workspace routes. `index.vue` maps to `/workspace`; `templates/index.vue` maps to `/workspace/templates` (placeholder, no API).
- `app/pages/docs/[id].vue`: full-screen editor at `/docs/:id` or `/docs/new` (`:id` is the project id, or `new` via `WORKSPACE_NEW_PROJECT_ID`). The page loads project metadata, keeps a `cachedProject` to avoid flicker on route changes, and mounts `EditorWorkspace`.
- `app/pages/account.vue`: account settings at `/account`, reached from `UserAccountMenu`.
- Product URLs stay language-neutral (`/workspace`, `/docs/:id`, `/account`); localized product URLs such as `/en/workspace` redirect to the canonical path without a locale prefix.
- `app/features/product-shell`: sidebar-backed product shell. Navigation is centralized in `config.ts` through `productNavItems` and `productFooterNavItems`. Account is not a sidebar item; it lives in `UserAccountMenu`.
- `app/features/account-shell`: account settings shell with top bar and compact sidebar via `accountNavItems`.
- `app/features/account`: account settings UI (`AccountPage`) for profile display and logout.
- `app/features/workspace`: workspace dashboard UI (`WorkspaceDashboard`, `WorkspaceProjectCard`) and project API adapters in `api.ts`. Create navigates to `/docs/new`; cards use decorative accent thumbnails; share/download/favorite actions are UI-only placeholders. Dashboard prefetches editor route and feature chunk on idle.
- `app/features/editor`: PPT-style editor UI (`EditorWorkspace`, `EditorWorkspaceHeader`) built on `@yanivjs/yaniv-editor` (`mode: edit`, `preset: full`). Content autosaves after 2s debounce; title edits sync to both document and project APIs; route leave flushes pending saves.
- `app/features/templates`: theme templates placeholder UI (`ThemeTemplatesPage`).
- `app/features`: other product and domain modules. Complex product UI, feature composables, feature stores, feature types, and feature API adapters grow here instead of top-level Nuxt folders.
- `app/lib/http`: shared HTTP wrapper, response types, header helpers, envelope validation (`assertApiSuccess`), error normalization, and typed `$fetch` client creation.
- `app/api`: cross-feature request adapters (`public.ts`, `auth.ts`) plus scenario client factories in `clients.ts`.
- `app/composables`: shared runtime APIs — `useAuth`, `useLocalePath`, `usePageSeo`, `useTheme`, `useLanguageSwitch`, and `useUserAvatar`. Feature-specific composables belong under `app/features/<feature>/composables`; feature-only request adapters belong under `app/features/<feature>/api.ts`.
- `app/api/public.ts`: SEO-safe public content adapters. Public adapters must not depend on auth state or trigger token refresh.
- `app/api/auth.ts`: Bearer Token auth adapter. It owns login, register, refresh, logout, `/me`, profile requests, response normalization, single-flight token refresh, and `createProductApiClient()`.
- `app/features/workspace/api.ts`: authenticated workspace project adapters.
- `app/features/editor/api.ts`: authenticated editor document adapters.
- `app/utils`: small shared runtime utilities such as `antdIcon.ts` for on-demand Ant Design SVG icons, `auth-session.ts` for token cookie helpers, `attribution-params.ts` for marketing attribution persistence, `safe-redirect.ts` for login redirect validation, and `load-script.ts` for deferred external script injection.
- `app/stores`: Pinia stores for language state, theme state, and opt-in auth state. Feature-specific stores belong under `app/features/<feature>/stores`.
- `app/components/base`: reusable low-level examples such as `AppContainer`, `PageContainer`, `BaseLogo`, `BaseButton`, and `BasePicture`.
- `app/components/layout`: shell components including `AppHeader`, `AppFooter`, `AppShellHeader`, `LanguageSwitcher`, `ThemeSwitch`, and `UserAccountMenu`.
- `app/layouts`: route-level shells. `default` for public pages, `product` for sidebar-backed workspace routes, `editor` for full-screen editor routes, `account` for account settings, and `empty` for minimal pages.
- `app/middleware/locale.global.ts`: global locale normalization before page rendering, including product canonical 301 redirects via `localizedProductPathToCanonical`.
- `app/middleware/auth.ts`: named auth middleware for protected product routes (session, login redirect, RBAC). Does not handle product canonical redirects.
- `app/plugins`: startup hooks such as `auth.ts` session hydration, `i18n.ts` setup, `attribution.client.ts` first-load and SPA attribution capture, and `analytics.client.ts` deferred third-party script loading behind env guards.
- `config`: site metadata, route lists, auth constants, theme tokens, and typed local content.
- `config/site.ts`: site metadata, supported locales, navigation, and `PUBLIC_PAGE_PATHS` (`/`, `/pricing`, `/about`, `/help`, `/news`). Sign-in and sign-up are intentionally excluded.
- `config/auth.ts`: auth endpoint paths, cookie keys, token max ages, auth route meta types, and frontend redirect constants (`AUTH_REDIRECTS.login = '/sign-in'`).
- `config/routes.ts`: public/product path helpers, prerender/SWR/CSR route rule sources, and localized product URL canonicalization (`isProductPath`, `localizedProductPathToCanonical`).
- `config/content/faq.ts`: typed local FAQ content consumed by `~/api/public`.
- `server/middleware/product-canonical.ts`: early server-side 301 redirect for localized product URLs, for example `/en/workspace` to `/workspace`.
- `server/routes/robots.txt.ts` and `server/routes/sitemap.xml.ts`: SEO server routes. They include public localized pages and content detail pages while excluding sign-in, sign-up, and product routes.
- `i18n`: `vue-i18n` setup, `SITE_LANG_MAP`, locale message modules, and language-switch URL helpers.
- `docker`: Dockerfiles, Compose layers, and the Nginx gateway sample for the default Node server path.

## Rendering Strategy

Route rendering is centralized in `nuxt.config.ts` through `config/routes.ts`:

- Default public routes: SSR.
- `prerenderRoutes`: build-time static HTML for selected public pages such as `/`, `/about`, `/help`, and their `/en` variants.
- `swrRouteRules`: SSR with 1-hour SWR cache for `/news/**`, `/en/news/**`, `/pricing`, and `/en/pricing`.
- `csrRouteRules`: client-only rendering for product routes (`/workspace/**`, `/docs/**`, `/account`).

This keeps SEO pages cache-friendly while product pages stay session-aware and interaction-heavy.

## Runtime Flow

`locale.global.ts` normalizes routes before page rendering. It removes trailing slashes, redirects `/zh` and `/zh/*` to default-language paths, redirects localized product paths such as `/en/workspace` to language-neutral `/workspace`, returns 404 for unsupported language prefixes such as `/fr/pricing`, loads locale messages, and updates the language store.

`auth.ts` runs on protected product pages. It ensures session, redirects unauthenticated users to localized `/sign-in?redirect=` (via `localizedPath(AUTH_REDIRECTS.login, currentLanguage)`), and enforces optional role/permission meta. Product canonical redirects are handled only by locale middleware and server middleware.

Pages call `usePageSeo` for canonical, alternate, OG, and noindex behavior. Public page paths are centralized in `config/site.ts` through `PUBLIC_PAGE_PATHS`; `config/routes.ts` expands them for `routeRules`, sitemap generation, and hreflang generation. Product route patterns are centralized in `config/routes.ts`; `/workspace/**`, `/docs/**`, and `/account` are CSR-only because logged-in product routes are not localized in the URL.

Business requests use the app-level `{ code, message, data }` contract through scenario-specific API entrypoints:

- Public SEO/content pages use `~/api/public` and `createPublicApiClient()` when a backend request is needed. These requests strip `authorization` and `cookie` headers so they stay safe for SSR, prerender, SWR, and CDN caching.
- Auth requests use `~/api/auth`. The adapter targets the current application API contract directly: `{ code, message, data }`; pages and stores read business payloads from `data`.
- Workspace project requests use `~/features/workspace/api.ts` through `fetchWorkspaceProjects()`, `createWorkspaceProject()`, `fetchWorkspaceProject()`, `updateWorkspaceProject()`, and `deleteWorkspaceProject()` with `createProductApiClient()`. `getWorkspaceDocPath(projectId)` and `getWorkspaceNewDocPath()` build editor links.
- Editor document requests use `~/features/editor/api.ts` through `fetchEditorDocument()` and `saveEditorDocument()` with `createProductApiClient()`.
- Logged-in product pages mount feature modules under `app/features/*`. `/workspace` and `/workspace/templates` use the `product` layout with `ProductShell` sidebar navigation (`productNavItems`, `productFooterNavItems` with pricing link) and `AppShellHeader`. `/docs/[id].vue` uses the minimal `editor` layout (full-screen slot only). For existing projects it loads by route `:id`, requires a linked `documentId`, then mounts `EditorWorkspace`. For `/docs/new`, the editor stays in draft mode until first non-blank save triggers `createWorkspaceProject()` and `router.replace()` to `/docs/:id`. Autosave debounces 2 seconds, title edits call both `saveEditorDocument()` and `updateWorkspaceProject()`, and `onBeforeRouteLeave` flushes pending saves. `/account` uses the `account` layout with `AccountShell` and loads extended profile via `fetchProfileApi()`. These routes are CSR by default; requests attach Bearer tokens and retry once after a single-flight refresh.

Page components should call domain adapters such as `fetchNewsArticles()`, `fetchLocalizedNewsArticle()`, `fetchPricingPage()`, `fetchWorkspaceProjects()`, `createWorkspaceProject()`, `fetchWorkspaceProject()`, `updateWorkspaceProject()`, `deleteWorkspaceProject()`, `fetchEditorDocument()`, or `saveEditorDocument()`, not raw backend URLs. This keeps backend contract changes localized to `~/api/*` and `~/features/*/api.ts`.
