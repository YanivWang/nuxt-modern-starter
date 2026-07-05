# Architecture

`nuxt-modern-starter` is organized as a reusable public-site and product-app foundation. Core behavior lives in shared config, API core policy, scenario composables, domain adapters, stores, and typed local content so pages stay focused on composition.

## Directory Responsibilities

- `app/pages/[[language]]`: localized public routes. Default language has no prefix, English uses `/en`.
- `app/api-core`: low-level API policy such as response types, error normalization, header creation, sensitive header redaction, and typed `$fetch` client creation.
- `app/composables`: scenario runtime APIs such as `usePublicApi`, `useEditorApi`, `useApi`, `useAuth`, `useLocalePath`, `usePageSeo`, and `useTheme`.
- `app/apis/public`: SEO-safe public content adapters. Public adapters must not depend on auth state or trigger token refresh.
- `app/apis/auth`: Bearer Token auth adapter. It owns login, register, refresh, logout, `/me`, profile requests, response normalization, and single-flight token refresh.
- `app/apis/editor`: authenticated editor workflow adapters. Document save/read, asset upload, export, and future collaboration APIs should grow here instead of inside page components.
- `app/utils`: small shared runtime utilities and compatibility re-exports.
- `app/stores`: Pinia stores for app UI state, language state, theme state, and opt-in auth state.
- `app/components/base`: reusable low-level examples such as `BaseLogo`, `BaseButton`, and `PageContainer`.
- `app/components/layout`: shell components with no business dependencies.
- `config`: site metadata, route lists, theme tokens, and typed local content.
- `i18n`: `vue-i18n` setup and language message modules.
- `docker`: Dockerfiles, Compose layers, and the Nginx gateway sample for the default Node server path.

## Runtime Flow

`locale.global.ts` normalizes routes before page rendering. It removes trailing slashes, redirects `/zh` and `/zh/*` to default-language paths, returns 404 for unsupported language prefixes such as `/fr/pricing`, loads locale messages, and updates the language store.

Pages call `usePageSeo` for canonical, alternate, OG, and noindex behavior. Public page paths are centralized in `config/routes.ts` so `routeRules` and hreflang generation stay aligned.

Business requests use the app-level `{ code, message, data }` contract through scenario-specific API entrypoints:

- Public SEO/content pages use `app/apis/public/*` and `usePublicApi` when a backend request is needed. These requests are token-free by default so they remain compatible with SSR, prerender, SWR, and CDN caching.
- Auth requests use `app/apis/auth`. The adapter currently targets `express-modern-starter`, whose backend responses are flat `{ code, msg, ...fields }`; the adapter normalizes those responses at the boundary so pages and stores still consume `message`.
- Editor and other logged-in product workflows use `app/apis/editor/*` and `useEditorApi`. These requests may attach Bearer tokens and retry once after a single-flight refresh.

Page components should call domain adapters such as `getNewsArticles()` or `saveEditorDocument()`, not raw backend URLs. This keeps backend contract changes localized to `app/apis/*`.
