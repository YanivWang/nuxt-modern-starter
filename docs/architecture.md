# Architecture

`nuxt-modern-starter` is organized as a reusable public-site foundation. Core behavior lives in shared config, composables, stores, and typed local content so pages stay focused on composition.

## Directory Responsibilities

- `app/pages/[[language]]`: localized public routes. Default language has no prefix, English uses `/en`.
- `app/composables`: shared runtime APIs such as `useApi`, `useAuth`, `useLocalePath`, `usePageSeo`, and `useTheme`.
- `app/apis`: backend API adapters. Adapters hide backend-specific response shapes and expose the app-level `message` field to stores and pages.
- `app/utils`: small shared runtime utilities such as API response normalization.
- `app/stores`: Pinia stores for app UI state, language state, theme state, and opt-in auth state.
- `app/components/base`: reusable low-level examples such as `BaseLogo`, `BaseButton`, and `PageContainer`.
- `app/components/layout`: shell components with no business dependencies.
- `config`: site metadata, route lists, theme tokens, and typed local content.
- `i18n`: `vue-i18n` setup and language message modules.
- `server/api`: Nitro API examples.
- `server/routes`: generated SEO assets such as `robots.txt` and `sitemap.xml`.
- `docker`: Dockerfiles, Compose layers, and the Nginx gateway sample for the default Node server path.

## Runtime Flow

`locale.global.ts` normalizes routes before page rendering. It removes trailing slashes, redirects `/zh` and `/zh/*` to default-language paths, returns 404 for unsupported language prefixes such as `/fr/pricing`, loads locale messages, and updates the language store.

Pages call `usePageSeo` for canonical, alternate, OG, and noindex behavior. Public page paths are centralized in `config/routes.ts` so `routeRules`, sitemap, and hreflang generation stay aligned.

Business requests use the app-level `{ code, message, data }` contract through `useApi`. Auth endpoints currently target `express-modern-starter`, whose backend responses are flat `{ code, msg, ...fields }`; `app/apis/auth.ts` normalizes those responses at the adapter boundary so pages and stores still consume `message`.
