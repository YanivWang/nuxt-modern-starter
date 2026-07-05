# Architecture

`nuxt-modern-starter` is organized as a reusable public-site and product-app foundation. Public SEO pages and logged-in product pages share Nuxt infrastructure, but they have separate route, rendering, data, and module boundaries. Pages stay thin: public pages compose content and SEO, while product pages mount feature modules under `app/features/*`.

## Directory Responsibilities

- `app/pages/[[language]]`: localized public route entries. Default language has no prefix, English public pages use `/en`. Current pages include home, pricing, help, news list/detail, login, register, and the catch-all 404 handler.
- `app/pages/app`: logged-in product route entries. Current pages: `workspace/index.vue` (`/app/workspace`), `docs/[id].vue` (`/app/docs/:id`), and `account.vue` (`/app/account`). Canonical URLs stay language-neutral under `/app/**`; localized product URLs such as `/en/app/workspace` redirect back to `/app/workspace`.
- `app/features/product-shell`: logged-in product shell configuration and layout surface. Product navigation and `/app/**` route policy are centralized in `config.ts` through `productRouteConfigs` and `ProductRouteMode` (`workspace`, `docs`, `account`). Sidebar nav exposes workspace and account only; `/app/docs/:id` is registered with `mode: 'docs'` without a sidebar entry and uses the dedicated `editor` layout.
- `app/features/workspace`: workspace dashboard UI and project API adapters in `api.ts`.
- `app/features/editor`: editor UI (`EditorWorkspace`) built on `@yanivjs/yaniv-editor`.
- `app/features`: other product and domain modules. Complex product UI, feature composables, feature stores, feature types, and feature API adapters grow here instead of top-level Nuxt folders.
- `app/api-core`: low-level API policy such as response types, error normalization, header creation, sensitive header redaction, and typed `$fetch` client creation.
- `app/composables`: shared runtime APIs such as `useAuth`, `useLocalePath`, `usePageSeo`, and `useTheme`. Feature-specific composables belong under `app/features/<feature>/composables`; backend request clients belong under `app/apis/*`.
- `app/apis/public`: SEO-safe public content adapters. Public adapters must not depend on auth state or trigger token refresh.
- `app/apis/auth`: Bearer Token auth adapter. It owns login, register, refresh, logout, `/me`, profile requests, response normalization, and single-flight token refresh.
- `app/apis/product`: authenticated product workflow client factory only (`createProductApiClient()`). Business adapters such as workspace project APIs live under `app/features/workspace/api.ts`.
- `app/apis/editor`: authenticated editor workflow adapters shared by editor feature routes. Document save/read APIs live in `document.ts`; future asset upload, export, and collaboration APIs should grow here or move into `app/features/editor/api` when they become feature-internal.
- `app/utils`: small shared runtime utilities such as `antdIcon.ts` for on-demand Ant Design SVG icons and `auth-session.ts` for token cookie helpers.
- `app/stores`: Pinia stores for app UI state, language state, theme state, and opt-in auth state. Feature-specific stores belong under `app/features/<feature>/stores`.
- `app/components/base`: reusable low-level examples such as `BaseLogo`, `BaseButton`, and `PageContainer`.
- `app/components/layout`: shell components with no business dependencies.
- `app/layouts`: route-level shells. `default` for public pages, `product` for sidebar-backed product pages, `editor` for full-screen editor routes, and `empty` for minimal pages.
- `app/middleware/locale.global.ts`: global locale normalization before page rendering.
- `app/middleware/auth.ts`: named auth middleware for protected product routes.
- `app/plugins`: startup hooks such as `auth.ts` session hydration and `i18n.ts` setup.
- `config`: site metadata, route lists, auth constants, theme tokens, and typed local content.
- `config/auth.ts`: auth endpoint paths, cookie keys, token max ages, and auth route meta types.
- `config/routes.ts`: public/product path helpers, prerender/SWR/CSR route rule sources, and localized product URL canonicalization.
- `server/middleware/product-canonical.ts`: early server-side 301 redirect for localized product URLs, for example `/en/app/workspace` to `/app/workspace`.
- `server/routes/robots.txt.ts` and `server/routes/sitemap.xml.ts`: SEO server routes. They include public localized pages and content detail pages while excluding login, register, and `/app/**` product routes.
- `i18n`: `vue-i18n` setup, `SITE_LANG_MAP`, locale message modules, and language-switch URL helpers.
- `docker`: Dockerfiles, Compose layers, and the Nginx gateway sample for the default Node server path.

## Rendering Strategy

Route rendering is centralized in `nuxt.config.ts` through `config/routes.ts`:

- Default public routes: SSR.
- `prerenderRoutes`: build-time static HTML for selected public pages such as `/`, `/pricing`, `/help`, and their `/en` variants.
- `swrRouteRules`: SSR with 1-hour SWR cache for `/news/**` and `/en/news/**`.
- `csrRouteRules`: client-only rendering for all `/app/**` product routes.

This keeps SEO pages cache-friendly while product pages stay session-aware and interaction-heavy.

## Runtime Flow

`locale.global.ts` normalizes routes before page rendering. It removes trailing slashes, redirects `/zh` and `/zh/*` to default-language paths, redirects localized product paths such as `/en/app/workspace` to language-neutral `/app/workspace`, returns 404 for unsupported language prefixes such as `/fr/pricing`, loads locale messages, and updates the language store.

`auth.ts` runs on protected product pages. Before auth checks, it also normalizes localized product URLs through the same canonical helper used by locale middleware and server middleware.

Pages call `usePageSeo` for canonical, alternate, OG, and noindex behavior. Public page paths are centralized in `config/routes.ts` so `routeRules`, sitemap generation, and hreflang generation stay aligned. Product route patterns are also centralized there; only `/app/**` is generated as a CSR-only route rule because logged-in product routes are not localized in the URL.

Business requests use the app-level `{ code, message, data }` contract through scenario-specific API entrypoints:

- Public SEO/content pages use `app/apis/public/*` and `createPublicApiClient()` when a backend request is needed. These requests strip `authorization` and `cookie` headers so they stay safe for SSR, prerender, SWR, and CDN caching.
- Auth requests use `app/apis/auth`. The adapter targets the current application API contract directly: `{ code, message, data }`; pages and stores read business payloads from `data`.
- Workspace project requests use `app/features/workspace/api.ts` through `fetchWorkspaceProjects()`, `createWorkspaceProject()`, `fetchWorkspaceProject()`, and `deleteWorkspaceProject()` with `createProductApiClient()`. `getWorkspaceDocPath(projectId)` builds `/app/docs/:id` editor links from a project id.
- Editor document requests use `app/apis/editor/document.ts` through `fetchEditorDocument()` and `saveEditorDocument()` with `createEditorApiClient()`. `createEditorApiClient()` delegates to the shared product client so token refresh behavior stays consistent across product and editor APIs.
- Logged-in product pages under `/app/**` mount feature modules such as `app/features/workspace` and `app/features/editor`. `/app/workspace` and `/app/account` use the `product` layout with sidebar navigation. `/app/docs/[id].vue` uses the `editor` layout, loads the project by route `:id`, requires a linked `documentId`, then mounts `EditorWorkspace` with `@yanivjs/yaniv-editor`, 2-second debounced autosave, and route-leave flush. These routes are CSR by default; requests may attach Bearer tokens and retry once after a single-flight refresh.

Page components should call domain adapters such as `getNewsArticles()`, `fetchWorkspaceProjects()`, `createWorkspaceProject()`, `fetchWorkspaceProject()`, `deleteWorkspaceProject()`, `fetchEditorDocument()`, or `saveEditorDocument()`, not raw backend URLs. This keeps backend contract changes localized to `app/apis/*` and `app/features/workspace/api.ts`.
