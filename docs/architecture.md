# Architecture

`nuxt-modern-starter` is organized as a reusable public-site and product-app foundation. Public SEO pages and logged-in product pages share Nuxt infrastructure, but they have separate route, rendering, data, and module boundaries. Pages stay thin: public pages compose content and SEO, while product pages mount feature modules under `app/features/*`.

## Directory Responsibilities

- `app/pages/[[language]]`: localized public route entries. Default language has no prefix, English public pages use `/en`.
- `app/pages/app`: logged-in product route entries. Their canonical URLs stay language-neutral under `/app/**`; legacy localized product URLs such as `/en/app/workspace` redirect back to `/app/workspace`.
- `app/features/product-shell`: logged-in product shell configuration and layout surface. Product navigation and `/app/**` route policy are centralized here instead of being hardcoded in the layout.
- `app/features`: product and domain modules. Complex product UI, feature composables, feature stores, feature types, and feature API adapters grow here instead of top-level Nuxt folders.
- `app/api-core`: low-level API policy such as response types, error normalization, header creation, sensitive header redaction, and typed `$fetch` client creation.
- `app/composables`: shared runtime APIs such as `useAuth`, `useLocalePath`, `usePageSeo`, and `useTheme`. Feature-specific composables belong under `app/features/<feature>/composables`; backend request clients belong under `app/apis/*`.
- `app/apis/public`: SEO-safe public content adapters. Public adapters must not depend on auth state or trigger token refresh.
- `app/apis/auth`: Bearer Token auth adapter. It owns login, register, refresh, logout, `/me`, profile requests, response normalization, and single-flight token refresh.
- `app/apis/product`: authenticated product workflow client factory. Workspace project and other logged-in product APIs should call `createProductApiClient()` through feature-level adapters.
- `app/apis/editor`: authenticated editor workflow adapters shared by editor feature routes. Document save/read, asset upload, export, and future collaboration APIs should grow here or move into `app/features/editor/api` when they become feature-internal.
- `app/utils`: small shared runtime utilities that do not belong to a feature or API core module.
- `app/stores`: Pinia stores for app UI state, language state, theme state, and opt-in auth state. Feature-specific stores belong under `app/features/<feature>/stores`.
- `app/components/base`: reusable low-level examples such as `BaseLogo`, `BaseButton`, and `PageContainer`.
- `app/components/layout`: shell components with no business dependencies.
- `config`: site metadata, route lists, theme tokens, and typed local content.
- `server/middleware/product-canonical.ts`: early canonical redirect for localized product URLs, for example `/en/app/workspace` to `/app/workspace`, before page auth logic runs.
- `server/routes/robots.txt.ts` and `server/routes/sitemap.xml.ts`: SEO server routes. They include public localized pages and content detail pages while excluding login, register, and `/app/**` product routes.
- `i18n`: `vue-i18n` setup and language message modules.
- `docker`: Dockerfiles, Compose layers, and the Nginx gateway sample for the default Node server path.

## Runtime Flow

`locale.global.ts` normalizes routes before page rendering. It removes trailing slashes, redirects `/zh` and `/zh/*` to default-language paths, redirects localized product paths such as `/en/app/workspace` to language-neutral `/app/workspace`, returns 404 for unsupported language prefixes such as `/fr/pricing`, loads locale messages, and updates the language store.

Pages call `usePageSeo` for canonical, alternate, OG, and noindex behavior. Public page paths are centralized in `config/routes.ts` so `routeRules`, sitemap generation, and hreflang generation stay aligned. Product route patterns are also centralized there; only `/app/**` is generated as a CSR-only route rule because logged-in product routes are not localized in the URL.

Business requests use the app-level `{ code, message, data }` contract through scenario-specific API entrypoints:

- Public SEO/content pages use `app/apis/public/*` and `createPublicApiClient()` when a backend request is needed. These requests strip `authorization` and `cookie` headers so they stay safe for SSR, prerender, SWR, and CDN caching.
- Auth requests use `app/apis/auth`. The adapter targets the current application API contract directly: `{ code, message, data }`; pages and stores read business payloads from `data`.
- Workspace project requests use `app/features/workspace/api.ts` through `createProductApiClient()` for authenticated project list/create/read flows.
- Editor document requests use `app/apis/editor/*` through `createEditorApiClient()` for authenticated document read/save flows. `createEditorApiClient()` delegates to the shared product client so token refresh behavior stays consistent across product and editor APIs.
- Logged-in product pages under `/app/**` mount feature modules such as `app/features/workspace` and `app/features/editor`. These routes are CSR by default; requests may attach Bearer tokens and retry once after a single-flight refresh.

Page components should call domain adapters such as `getNewsArticles()` or `saveEditorDocument()`, not raw backend URLs. This keeps backend contract changes localized to `app/apis/*`.
