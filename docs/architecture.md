# Architecture

`nuxt-modern-starter` is organized as a reusable public-site foundation. Core behavior lives in shared config, composables, stores, and typed local content so pages stay focused on composition.

## Directory Responsibilities

- `app/pages/[[language]]`: localized public routes. Default language has no prefix, English uses `/en`.
- `app/composables`: shared runtime APIs such as `useApi`, `useLocalePath`, `usePageSeo`, and `useTheme`.
- `app/stores`: Pinia stores for app UI state, language state, and theme state. Auth is intentionally not present in v0.1-core.
- `app/components/base`: reusable low-level examples such as `BaseLogo`, `BaseButton`, and `PageContainer`.
- `app/components/layout`: shell components with no business dependencies.
- `config`: site metadata, route lists, theme tokens, and typed local content.
- `i18n`: `vue-i18n` setup and language message modules.
- `server/api`: Nitro API examples.
- `server/routes`: generated SEO assets such as `robots.txt` and `sitemap.xml`.
- `deploy`: deployment examples for the default Node server path.

## Runtime Flow

`locale.global.ts` normalizes routes before page rendering. It removes trailing slashes, redirects `/zh` and `/zh/*` to default-language paths, returns 404 for unsupported language prefixes such as `/fr/pricing`, loads locale messages, and updates the language store.

Pages call `usePageSeo` for canonical, alternate, OG, and noindex behavior. Public page paths are centralized in `config/routes.ts` so `routeRules`, sitemap, and hreflang generation stay aligned.
