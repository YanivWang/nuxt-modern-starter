# Usage

## Add a Page

Create public SEO pages directly under `app/pages/[[language]]`. Use `localePath()` for internal links and call `usePageSeo()` with the unprefixed canonical path.

When a page should be public, add its base path to `PUBLIC_PAGE_PATHS` in `config/site.ts`. If it needs prerendering or SWR behavior, update `config/routes.ts` so routeRules and hreflang remain synchronized.

Create logged-in product pages under `app/pages/app`, and keep links, canonical paths, and route config under language-neutral `/app/**` URLs. Product pages should set the product or editor layout, opt in to auth middleware when required, set `noindex`, and mount a feature component from `app/features/*`.

Do not add product pages such as account, documents, editor, templates, workspace, billing, or settings beside public marketing pages. Product routes are client-rendered by default through `csrRouteRules` in `config/routes.ts`.

Register product navigation and route policy in `app/features/product-shell/config.ts` before adding sidebar links or new `/app/**` route entries. Do not create localized product links such as `/en/app/...`; the global locale middleware redirects those back to `/app/...`.

## Add A Feature Module

Create complex product behavior under `app/features/<feature>`.

```txt
app/features/editor/
  components/
  composables/
  stores/
  api/
  types/
  constants/
  utils/
  index.ts
```

Use the feature `index.ts` as the public export surface. Nuxt pages and other features should import from `app/features/<feature>` instead of importing internal files from another feature.

Keep top-level `app/components`, `app/composables`, and `app/stores` for shared primitives only.

## Add Requests

Choose the request entrypoint by page and data ownership:

- Public SEO, marketing, help, pricing, news, and docs data belongs in `app/apis/public/*`. Use local typed content there, or call `createPublicApiClient()` inside a domain adapter for token-free backend requests.
- Login, register, refresh, logout, `/me`, and profile requests belong in `app/apis/auth`.
- Editor document, asset, export, and collaboration requests belong in `app/apis/editor/*` or `app/features/editor/api` and should call `createEditorApiClient()` through a named domain adapter.
- Do not add a generic catch-all request composable. Add a named public, auth, editor, or feature client when a new request scenario appears.

All request helpers use `runtimeConfig.public.apiBase` in both SSR and browser code, so `NUXT_PUBLIC_API_BASE` should point directly to the real backend API origin, for example `https://api.example.com/api`.

The app-level API contract uses `{ code, message, data }` for every business response. `message` is the only human-readable status field, and business payloads must live under `data`.

Sensitive `authorization` and `cookie` values are redacted from error logs.

Public adapters must stay free of token cookies and refresh behavior. This keeps prerender, SWR, crawlers, and CDN caches from being coupled to a visitor's session.

## Add SEO

Use `usePageSeo({ path, title, description })`. The composable adds title, description, canonical, OG metadata, and alternate links for public `zh-CN` and `en-US` pages. `noindex` product pages keep canonical and OG metadata but skip alternate links.

News details can pass the `article` field to generate Article JSON-LD. `Organization` and `WebSite` JSON-LD are recommended future additions when a real brand domain and logo are available.

`server/routes/sitemap.xml.ts` and `server/routes/robots.txt.ts` are generated from public route/content configuration. Keep `/app/**`, login, and register pages out of sitemap and blocked in robots rules.

## Add Languages

v0.1-core ships `zh-CN` and `en-US`. To add a language, update `SUPPORTED_LOCALES`, `SITE_LOCALE_PREFIX_MAP`, and `SITE_LANG_MAP`, then add `i18n/<locale>/index.ts` and routing/SEO tests.

Do not install `@nuxtjs/i18n` for this template. Language routing is intentionally handled by `locale.global.ts` and `useLocalePath.ts`. Public pages use URL prefixes such as `/en`; authenticated product pages stay under `/app/**` regardless of UI language.

## Theme Customization

Edit `config/theme.ts` and `app/assets/styles/tokens.scss` together. CSS variables are the preferred page styling API; pages should not hardcode brand colors, background colors, body text colors, or borders.

To disable dark mode, keep only light tokens, set `DEFAULT_THEME_MODE` to `light`, and remove the theme toggle in `AppHeader.vue`.

## Auth Extension Contract

Auth is implemented as an opt-in Bearer Token module for the current application API.

- Backend endpoints use the `/api` prefix and return the standard `{ code, message, data }` envelope. Auth calls use `app/apis/auth/index.ts` through `createAuthApiClient()`, and stores/pages consume token, user, and profile payloads from `data`.
- `POST /api/register` creates an account but does not log the user in. The register page redirects users to login after success.
- `POST /api/login` and `POST /api/refresh` return `token` or `accessToken`, plus `refreshToken`. Tokens are stored in JS-readable Nuxt cookies for client-side product workflows.
- `createAuthApiClient()` and `createEditorApiClient()` may attach the access token for authenticated business requests. A 401 triggers a single-flight `POST /api/refresh` and retries the failed request once; refresh failure clears the local session.
- `app/stores/auth.ts` owns `user`, token cookies, `status`, `login`, `register`, `logout`, `fetchMe`, `refresh`, and `reset`.
- `app/composables/useAuth.ts` exposes the store plus `ensureSession()`, `can()`, and `hasRole()` for pages and middleware.
- `app/plugins/auth.ts` hydrates `/api/me` on startup when token cookies are present.
- Protected routes opt in with `definePageMeta({ middleware: 'auth' })`. Optional `route.meta.auth.roles` and `route.meta.auth.permissions` are already checked by the middleware.
- The backend currently has no RBAC fields in JWT or `/api/me`. Frontend roles and permissions default to empty arrays and should be populated in `normalizeAuthUser()` once the backend contract adds them.
- Development and production both use `NUXT_PUBLIC_API_BASE` to call the backend directly. Configure CORS on the backend or gateway when the API origin differs from the frontend origin.

## Docker Deployment

Docker files live under `docker/`: production and development Dockerfiles, shared Compose base, environment-specific Compose overrides, and `docker/nginx/gateway.docker.conf`.

- Build a local production image with `pnpm docker:build`.
- Start production Compose with `pnpm docker:up`; it reads `.env.prod` and exposes the Nginx gateway on `GATEWAY_HOST_PORT` or `3000`.
- Start development Compose with `pnpm docker:up:dev`; it reads `.env.dev`, bind-mounts the repository, and proxies through the same gateway config.

## Out of Scope

Analytics, CMS, payment, membership, uploads, more languages, Playwright E2E, and remote CI are not part of v0.1-core. Add them as project-specific modules after the starter core is stable.

## Cuttable Modules

- Remove i18n: delete `i18n`, `app/plugins/i18n.ts`, `app/middleware/locale.global.ts`, `app/stores/language.ts`, and simplify pages from `[[language]]`.
- Remove Pinia: delete `app/stores`, remove `@pinia/nuxt`, and replace store usage with local state.
- Remove Ant Design Vue: remove `@ant-design-vue/nuxt`, `ant-design-vue`, `a-config-provider`, and Ant components.
- Remove Docker/Nginx: delete `.dockerignore`, `docker/`, and docker scripts.
- Remove news examples: delete `config/content/news.ts`, news pages, and related sitemap entries.
- Remove editor feature: delete `app/features/editor`, `app/apis/editor`, product editor pages under `app/pages/app`, and editor-specific tests.

After cutting modules, run `pnpm lint`, `pnpm stylelint`, `pnpm typecheck`, `pnpm test`, and `pnpm build`.
