# Architecture

`nuxt-modern-starter` is organized as a general-purpose Nuxt 4 frontend foundation for SaaS products. It provides a public website, SEO, i18n, sign-in/sign-up, user workspace, project management, account center, editor workflow, request layer, theme system, and deployment samples. Public acquisition pages and logged-in product pages share Nuxt infrastructure, but they have separate route, rendering, data, and module boundaries. The default product loop is intentionally narrow: account -> workspace -> project -> editor -> autosave. Pages stay thin: public pages compose content and SEO, while product pages mount feature modules under `app/features/*`.

## Directory Responsibilities

- `app/pages/[[language]]`: localized public route entries. The default language (`zh-CN`) has no prefix; each of the other 14 locales uses its own prefix from `SITE_LOCALE_PREFIX_MAP` (`/en`, `/kr`, `/zh-hk`, …). Current pages include home, pricing, about, help, news list/detail, sign-in, sign-up, and the catch-all 404 handler.
- `app/pages/workspace`: logged-in workspace routes. `index.vue` maps to `/workspace`; `templates/index.vue` maps to `/workspace/templates` (optional template placeholder, no API).
- `app/pages/docs/[id].vue`: full-screen editor at `/docs/:id` or `/docs/new` (`:id` is the project id, or `new` via `WORKSPACE_NEW_PROJECT_ID`). The page loads project metadata, keeps a `cachedProject` to avoid flicker on route changes, and mounts `EditorWorkspace`.
- `app/pages/account.vue`: account settings at `/account`, reached from `UserAccountMenu`.
- Product URLs stay language-neutral (`/workspace`, `/docs/:id`, `/account`); localized product URLs such as `/en/workspace` redirect to the canonical path without a locale prefix.
- `app/features/product-shell`: sidebar-backed product shell. Navigation is centralized in `config.ts` through `productNavItems` and `productFooterNavItems`. Account is not a sidebar item; it lives in `UserAccountMenu`.
- `app/features/account-shell`: account settings shell with top bar and compact sidebar via `accountNavItems`.
- `app/features/account`: account settings UI (`AccountPage`) for profile display and logout.
- `app/features/workspace`: workspace dashboard UI (`WorkspaceDashboard`, `WorkspaceProjectCard`). Create navigates to `/docs/new`; cards use decorative accent thumbnails; share/download/favorite actions are UI-only placeholders. Dashboard prefetches the editor route on idle.
- `app/features/editor`: PPT-style editor UI (`EditorWorkspace`, `EditorWorkspaceHeader`) built on `@yanivjs/yaniv-editor` (`mode: edit`, `preset: full`). Content autosaves after 2s debounce; title edits sync to both document and project APIs; route leave flushes pending saves.
- `app/features/templates`: optional theme templates placeholder UI (`ThemeTemplatesPage`).
- `app/features`: other SaaS product modules. Complex product UI, feature composables, feature stores, feature types, and feature API adapters grow here instead of top-level Nuxt folders.
- `app/lib/http`: shared HTTP wrapper, response types, header helpers, envelope validation (`assertApiSuccess`), error normalization, and typed `$fetch` client creation.
- `app/api`: cross-feature request adapters (`public.ts`, `auth.ts`, `workspace-project.ts`) plus scenario client factories in `clients.ts` (`createPublicApiClient`, `createAuthApiClient`); `createProductApiClient()` lives in `auth.ts`.
- `app/types`: shared domain types such as `document.ts` and `workspace-project.ts`. Types used by more than one feature belong here instead of inside a feature.
- `app/composables`: shared runtime APIs — `useAuth`, `useAuthSession` consumers, `useLocalePath`, `usePageSeo`, `useTheme`, `useLanguageSwitch`, `useUserAvatar`, and `useCoarsePointer`. Feature-specific composables belong under `app/features/<feature>/composables`; feature-only request adapters belong under `app/features/<feature>/api.ts`.
- `app/api/public.ts`: SEO-safe public content adapters. Public adapters must not depend on auth state or trigger token refresh.
- `app/api/auth.ts`: Bearer Token auth adapter. It owns login, register, refresh, logout, `/me`, profile requests, response normalization, single-flight token refresh, and `createProductApiClient()`.
- `app/api/workspace-project.ts`: authenticated workspace project adapters and editor route helpers.
- `app/features/editor/api.ts`: authenticated editor document adapters.
- `app/utils`: small shared runtime utilities such as `antdIcon.ts` for on-demand Ant Design SVG icons, `auth-session.ts` as the single owner of the auth tokens (`useAuthSession`; tokens never enter Pinia state, which is serialized into the SSR payload), `attribution-params.ts` for marketing attribution persistence, `safe-redirect.ts` for login redirect validation, and `load-script.ts` for deferred external script injection.
- `app/stores`: Pinia stores for language state, theme state, and opt-in auth state. Feature-specific stores belong under `app/features/<feature>/stores`.
- `app/components/base`: reusable low-level examples such as `AppContainer`, `PageContainer`, `BaseLogo`, `BaseButton`, and `BasePicture`.
- `app/components/layout`: shell components including `AppHeader`, `AppHeaderSignedOutActions`, `AppFooter`, `AppShellHeader`, `LanguageSwitcher`, `LanguageOptionList`, `ThemeSwitch`, and `UserAccountMenu`. `LanguageOptionList` is shared by the public switcher and the product user menu.
- `app/layouts`: route-level shells. `default` for public pages, `product` for sidebar-backed workspace routes, `editor` for full-screen editor routes, `account` for account settings, and `empty` for minimal pages.
- `app/middleware/locale.global.ts`: global locale normalization before page rendering, including product canonical 301 redirects via `localizedProductPathToCanonical`.
- `app/middleware/auth.ts`: named auth middleware for protected product routes (session, login redirect, RBAC). Does not handle product canonical redirects.
- `app/plugins`: startup hooks such as `auth.client.ts` session hydration (client-only so prerendered and SWR-cached HTML never depends on who is signed in), `i18n.ts` setup, `attribution.client.ts` first-load and SPA attribution capture, and `analytics.client.ts` deferred third-party script loading behind env guards.
- `app/assets/styles`: global SCSS entry (`main.scss`), layered tokens (`tokens/_variables.scss`, `_root.scss`, `_dark.scss`), UI patterns (`patterns/_page.scss`, `_home.scss`, `_product.scss`, `_editor.scss`), and runtime CSS var helpers (`tokens.ts`). Mounted from `nuxt.config.ts`; Sass variables are auto-injected into SFC style blocks.
- `config`: site metadata, route lists, auth constants, theme tokens, SWR cache driver selection (`cache.ts`), and typed local content.
- `config/site.ts`: site metadata, supported locales, navigation, and `PUBLIC_PAGE_PATHS` (`/`, `/pricing`, `/about`, `/help`, `/news`). Sign-in and sign-up are intentionally excluded.
- `config/auth.ts`: auth endpoint paths, cookie keys, token max ages, auth route meta types, and frontend redirect constants (`AUTH_REDIRECTS.login = '/sign-in'`).
- `config/routes.ts`: public/product path helpers, prerender/SWR/CSR route rule sources, and localized product URL canonicalization (`isProductPath`, `localizedProductPathToCanonical`).
- `config/content/faq.ts`: typed local FAQ content consumed by `~/api/public`.
- `server/middleware/canonical-path.ts`: early server-side 301 redirect to the canonical request path. It covers trailing slashes (`/about/` to `/about`), the default-locale prefix (`/zh/pricing` to `/pricing`), and localized product URLs (`/en/workspace` to `/workspace`). This layer is required rather than optional: prerendered output (the index.html emitted for `/about`) is served by Nitro as a static asset, so the request never reaches the Nuxt app and the client middleware cannot normalize it.
- `server/routes/robots.txt.ts` and `server/routes/sitemap.xml.ts`: SEO server routes. They include public localized pages and content detail pages while excluding sign-in, sign-up, and product routes.
- `server/api/revalidate.post.ts` and `server/utils/revalidate.ts`: protected on-demand SWR cache invalidation. The backend webhook calls `POST /api/revalidate` with `x-revalidate-secret` after news changes; `slug` expands to localized news list/detail paths.
- `i18n`: `vue-i18n` setup, locale message resolvers, and language-switch URL helpers. Locale metadata lives in `config/site.ts`.
- `docker`: Dockerfiles, Compose layers, and the Nginx gateway sample for the default Node server path.

## Rendering Strategy

Route rendering is centralized in `nuxt.config.ts` through `config/routes.ts`:

- Default public routes: SSR.
- `prerenderRoutes`: build-time static HTML for selected public pages such as `/`, `/about`, `/help`, and their `/en` variants.
- `swrRouteRules`: SSR with 1-hour SWR cache, expanded from `SWR_BASE_PATHS` across every supported locale. Each base path registers **both** the bare path and the subtree (`/news` and `/news/**`): Nitro registers a dedicated cached handler per SWR rule, and h3's router does not match `/news/**` against `/news`. `/pricing` and `/en/pricing` use default SSR (no SWR).
- `csrRouteRules`: client-only rendering for product routes (`/workspace/**`, `/docs/**`, `/account`).

News SWR pages can also be invalidated on demand through `POST /api/revalidate` when `NUXT_REVALIDATE_SECRET` is configured. This avoids waiting for the 1-hour TTL after CMS/API content changes.

This keeps SEO pages cache-friendly while logged-in product pages stay session-aware and interaction-heavy.

## Runtime Flow

`locale.global.ts` normalizes routes before page rendering. It removes trailing slashes, redirects `/zh` and `/zh/*` to default-language paths, redirects localized product paths such as `/en/workspace` to language-neutral `/workspace`, returns 404 for unsupported language prefixes such as `/xx/pricing` (note `/fr` is a supported prefix for `fr-FR`), loads locale messages, and updates the language store.

`auth.ts` runs on protected product pages. It ensures session, redirects unauthenticated users to localized `/sign-in?redirect=` (via `localizedPath(AUTH_REDIRECTS.login, currentLanguage)`), and enforces optional role/permission meta. Product canonical redirects are handled only by locale middleware and server middleware.

Pages call `usePageSeo` for canonical, alternate, OG, and noindex behavior. Public page paths are centralized in `config/site.ts` through `PUBLIC_PAGE_PATHS`; `config/routes.ts` expands them for `routeRules`, sitemap generation, and hreflang generation. Product route patterns are centralized in `config/routes.ts`; `/workspace/**`, `/docs/**`, and `/account` are CSR-only because logged-in product routes are not localized in the URL.

Business requests use the app-level `{ code, message, data }` contract through scenario-specific API entrypoints:

- Public SEO/content pages use `~/api/public` and `createPublicApiClient()` when a backend request is needed. These requests strip `authorization` and `cookie` headers so they stay safe for SSR, prerender, SWR, and CDN caching.
- Auth requests use `~/api/auth`. The adapter targets the current application API contract directly: `{ code, message, data }`; pages and stores read business payloads from `data`.
- Workspace project requests use `~/api/workspace-project` through `fetchWorkspaceProjects()`, `createWorkspaceProject()`, `fetchWorkspaceProject()`, `updateWorkspaceProject()`, and `deleteWorkspaceProject()` with `createProductApiClient()`. `getWorkspaceDocPath(projectId)` and `getWorkspaceNewDocPath()` build editor links.
- Editor document requests use `~/features/editor/api.ts` through `fetchEditorDocument()` and `saveEditorDocument()` with `createProductApiClient()`.
- Logged-in product pages mount feature modules under `app/features/*`. `/workspace` and `/workspace/templates` use the `product` layout with `ProductShell` sidebar navigation (`productNavItems`, `productFooterNavItems` with pricing link) and `AppShellHeader`. `/docs/[id].vue` uses the minimal `editor` layout (full-screen slot only). For existing projects it loads by route `:id`, requires a linked `documentId`, then mounts `EditorWorkspace`. For `/docs/new`, the editor stays in draft mode until first non-blank save triggers `createWorkspaceProject()` and `router.replace()` to `/docs/:id`. Autosave debounces 2 seconds, title edits call both `saveEditorDocument()` and `updateWorkspaceProject()`, and `onBeforeRouteLeave` flushes pending saves. `/account` uses the `account` layout with `AccountShell` and loads extended profile via `fetchProfileApi()`. These routes are CSR by default; requests attach Bearer tokens and retry once after a single-flight refresh.

Templates, AI generation, export, asset, membership, credit, order, payment, and other domain-specific flows are treated as optional product extensions. They should plug into this same feature/API pattern when the target SaaS product needs them. Organization, team, invite, multi-tenant workspace permissions, collaboration, and enterprise publishing systems are intentionally outside the default architecture; add them only when the project explicitly chooses that product direction.

Page components should call domain adapters such as `fetchNewsArticles()`, `fetchLocalizedNewsArticle()`, `fetchPricingPage()`, `fetchWorkspaceProjects()`, `createWorkspaceProject()`, `fetchWorkspaceProject()`, `updateWorkspaceProject()`, `deleteWorkspaceProject()`, `fetchEditorDocument()`, or `saveEditorDocument()`, not raw backend URLs. This keeps backend contract changes localized to `~/api/*` and feature-local APIs.
