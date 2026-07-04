# Usage

## Add a Page

Create the page under `app/pages/[[language]]`. Use `localePath()` for internal links and call `usePageSeo()` with the unprefixed canonical path.

When a page should be public, add its base path to `PUBLIC_PAGE_PATHS` in `config/site.ts`. If it needs prerendering or SWR behavior, update `config/routes.ts` so routeRules, sitemap, and hreflang remain synchronized.

## Add Requests

Use `useApi<T>()` for GET and `useApiPost<T>()` for POST. The helper uses `runtimeConfig.apiBase` on the server and `runtimeConfig.public.apiBase` in the browser.

Server-side external API requests only forward `cookie`, `authorization`, `x-request-id`, and `accept-language`. Sensitive values are redacted from error logs.

## Add SEO

Use `usePageSeo({ path, title, description })`. The composable adds title, description, canonical, OG metadata, and alternate links for `zh-CN` and `en-US`.

News details can pass the `article` field to generate Article JSON-LD. `Organization` and `WebSite` JSON-LD are recommended future additions when a real brand domain and logo are available.

## Add Languages

v0.1-core ships `zh-CN` and `en-US`. To add a language, update `SUPPORTED_LOCALES`, `SITE_LOCALE_PREFIX_MAP`, and `SITE_LANG_MAP`, then add `i18n/<locale>/index.ts` and routing/SEO tests.

Do not install `@nuxtjs/i18n` for this template. Language routing is intentionally handled by `locale.global.ts` and `useLocalePath.ts`.

## Theme Customization

Edit `config/theme.ts` and `app/assets/styles/tokens.scss` together. CSS variables are the preferred page styling API; pages should not hardcode brand colors, background colors, body text colors, or borders.

To disable dark mode, keep only light tokens, set `DEFAULT_THEME_MODE` to `light`, and remove the theme toggle in `AppHeader.vue`.

## Auth Extension Contract

Auth is implemented as an opt-in Bearer Token module for `express-modern-starter`.

- Backend endpoints use the `/api` prefix and return a flat `{ code, msg, ...fields }` envelope. Auth calls therefore use `app/apis/auth.ts` with `$fetch` instead of the generic `{ code, message, data }` `useApi<T>()` contract.
- `POST /api/register` creates an account but does not log the user in. The register page redirects users to login after success.
- `POST /api/login` and `POST /api/refresh` return `token` or `accessToken`, plus `refreshToken`. Tokens are stored in JS-readable Nuxt cookies so SSR can attach `Authorization: Bearer <token>`.
- `useApi<T>()` automatically attaches the access token cookie for business requests. A 401 triggers a single-flight `POST /api/refresh` and retries the failed request once; refresh failure clears the local session.
- `app/stores/auth.ts` owns `user`, token cookies, `status`, `login`, `register`, `logout`, `fetchMe`, `refresh`, and `reset`.
- `app/composables/useAuth.ts` exposes the store plus `ensureSession()`, `can()`, and `hasRole()` for pages and middleware.
- `app/plugins/auth.ts` hydrates `/api/me` on startup when token cookies are present.
- Protected routes opt in with `definePageMeta({ middleware: 'auth' })`. Optional `route.meta.auth.roles` and `route.meta.auth.permissions` are already checked by the middleware.
- The backend currently has no RBAC fields in JWT or `/api/me`. Frontend roles and permissions default to empty arrays and should be populated in `normalizeAuthUser()` once the backend contract adds them.
- Development uses `NUXT_PUBLIC_API_BASE=/api` and Nitro `devProxy` to proxy same-origin browser calls to `NUXT_DEV_PROXY_API`. In production, configure the backend `CORS_ORIGINS` to include the frontend origin when not serving from the same origin.

## Docker Deployment

Docker files follow the `express-modern-starter` layout under `docker/`: production and development Dockerfiles, shared Compose base, environment-specific Compose overrides, and `docker/nginx/gateway.docker.conf`.

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

After cutting modules, run `pnpm lint`, `pnpm stylelint`, `pnpm typecheck`, `pnpm test`, and `pnpm build`.
