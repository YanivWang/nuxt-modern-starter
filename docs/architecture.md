# Architecture

`nuxt-modern-starter` is organized as a reusable public-site and product-app foundation. Public SEO pages and logged-in product pages share Nuxt infrastructure, but they have separate route, rendering, data, and module boundaries. Pages stay thin: public pages compose content and SEO, while product pages mount feature modules under `app/features/*`.

## Directory Responsibilities

- `app/pages/[[language]]`: localized route entries. Default language has no prefix, English uses `/en`.
- `app/pages/[[language]]/app`: logged-in product routes. These routes are client-rendered by default, protected with auth where needed, and excluded from public SEO route lists.
- `app/features`: product and domain modules. Complex product UI, feature composables, feature stores, feature types, and feature API adapters grow here instead of top-level Nuxt folders.
- `app/api-core`: low-level API policy such as response types, error normalization, header creation, sensitive header redaction, and typed `$fetch` client creation.
- `app/composables`: shared runtime APIs such as `useAuth`, `useLocalePath`, `usePageSeo`, and `useTheme`. Feature-specific composables belong under `app/features/<feature>/composables`; backend request clients belong under `app/apis/*`.
- `app/apis/public`: SEO-safe public content adapters. Public adapters must not depend on auth state or trigger token refresh.
- `app/apis/auth`: Bearer Token auth adapter. It owns login, register, refresh, logout, `/me`, profile requests, response normalization, and single-flight token refresh.
- `app/apis/editor`: authenticated editor workflow adapters shared by editor feature routes. Document save/read, asset upload, export, and future collaboration APIs should grow here or move into `app/features/editor/api` when they become feature-internal.
- `app/utils`: small shared runtime utilities that do not belong to a feature or API core module.
- `app/stores`: Pinia stores for app UI state, language state, theme state, and opt-in auth state. Feature-specific stores belong under `app/features/<feature>/stores`.
- `app/components/base`: reusable low-level examples such as `BaseLogo`, `BaseButton`, and `PageContainer`.
- `app/components/layout`: shell components with no business dependencies.
- `config`: site metadata, route lists, theme tokens, and typed local content.
- `i18n`: `vue-i18n` setup and language message modules.
- `docker`: Dockerfiles, Compose layers, and the Nginx gateway sample for the default Node server path.

## Runtime Flow

`locale.global.ts` normalizes routes before page rendering. It removes trailing slashes, redirects `/zh` and `/zh/*` to default-language paths, returns 404 for unsupported language prefixes such as `/fr/pricing`, loads locale messages, and updates the language store.

Pages call `usePageSeo` for canonical, alternate, OG, and noindex behavior. Public page paths are centralized in `config/routes.ts` so `routeRules` and hreflang generation stay aligned. Product route patterns are also centralized there; `/app/**` and `/en/app/**` are generated as CSR-only route rules.

Business requests use the app-level `{ code, message, data }` contract through scenario-specific API entrypoints:

- Public SEO/content pages use `app/apis/public/*` and `createPublicApiClient()` when a backend request is needed. These requests strip `authorization` and `cookie` headers so they stay safe for SSR, prerender, SWR, and CDN caching.
- Auth requests use `app/apis/auth`. The adapter targets the current application API contract directly: `{ code, message, data }`; pages and stores read business payloads from `data`.
- Editor and other logged-in product workflows live under `/app/**`, use feature modules such as `app/features/editor`, and call `app/apis/editor/*` through `createEditorApiClient()` for authenticated requests. These routes are CSR by default; requests may attach Bearer tokens and retry once after a single-flight refresh.

Page components should call domain adapters such as `getNewsArticles()` or `saveEditorDocument()`, not raw backend URLs. This keeps backend contract changes localized to `app/apis/*`.
