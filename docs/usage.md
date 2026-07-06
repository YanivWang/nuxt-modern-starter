# Usage

## Release Quality Gate

Before tagging, deploying, or running `pnpm docker:up`, run the full local quality gate:

```bash
pnpm quality
```

`pnpm quality` runs `lint`, `format:check`, `stylelint`, `typecheck`, `test`, and `build`. Husky pre-commit still runs the faster subset (`lint`, `stylelint`, `typecheck`, `test`) on every commit and intentionally skips `format:check` and `build` to keep day-to-day commits fast.

Typical release flow:

```bash
pnpm quality
pnpm docker:up
```

`pnpm build` reads committed `.env.prod` placeholder URLs. Sitemap generation falls back to local slugs when the content API is unavailable, so the quality gate does not depend on a live backend.

## Add a Page

Create public SEO pages directly under `app/pages/[[language]]`. Use `localePath()` for internal links and call `usePageSeo()` with the unprefixed canonical path.

When a page should be public, add its base path to `PUBLIC_PAGE_PATHS` in `config/site.ts`. If it needs prerendering or SWR behavior, update `config/routes.ts` so routeRules and hreflang remain synchronized.

Create logged-in product pages under `app/pages/workspace`, `app/pages/docs`, or top-level `app/pages/account.vue`. Keep links, canonical paths, and route config under language-neutral product URLs (`/workspace`, `/docs/:id`, `/account`). Product pages should set the product or editor layout, opt in to auth middleware when required, set `noindex`, and mount a feature component from `app/features/*`.

Do not add product pages beside public marketing pages under `app/pages/[[language]]`. Product routes are client-rendered by default through `csrRouteRules` in `config/routes.ts`.

Register sidebar entries in `app/features/product-shell/config.ts` through `productNavItems` and `productFooterNavItems` before adding links. Do not create localized product links such as `/en/workspace`; locale middleware and server middleware redirect those back to canonical product paths. Account access belongs in `UserAccountMenu`, not the sidebar.

## Add A Feature Module

Create complex product behavior under `app/features/<feature>`.

```txt
app/features/editor/
  components/
  composables/
  stores/
  api.ts
  types/
  constants/
  utils/
  index.ts
```

Use the feature `index.ts` as the public export surface. Nuxt pages and other features should import from `app/features/<feature>` instead of importing internal files from another feature.

Keep top-level `app/components`, `app/composables`, and `app/stores` for shared primitives only.

## Add Requests

Choose the request entrypoint by page and data ownership:

- Public SEO, marketing, help, pricing, news, and docs data belongs in `~/api/public`. Use local typed content there, or call `createPublicApiClient()` inside the adapter for token-free backend requests.
- Sign-in, sign-up, refresh, logout, `/me`, and profile requests belong in `~/api/auth`.
- Workspace project requests belong in `~/features/workspace/api.ts` via `fetchWorkspaceProjects()`, `createWorkspaceProject()`, `fetchWorkspaceProject()`, and `deleteWorkspaceProject()` (paths `/projects`, `/projects/:projectId`). Use `getWorkspaceDocPath(projectId)` when linking to the editor route.
- Editor document requests belong in `~/features/editor/api.ts` via `fetchEditorDocument()` and `saveEditorDocument()` (paths `/documents/:documentId`). These call `createProductApiClient()` from `~/api/auth`.
- Do not add a generic catch-all request composable. Add a named public, auth, product, editor, or feature client when a new request scenario appears.

All request helpers use `runtimeConfig.public.apiBase` in both SSR and browser code, so `NUXT_PUBLIC_API_BASE` should point directly to the real backend API origin, for example `https://api.example.com/api`.

Local full-stack development with `nuxt-modern-starter-api` Docker defaults to:

- Nuxt app: `http://localhost:3000`
- API gateway: `http://localhost:2026/api`
- Backend `CORS_ORIGINS` must include the Nuxt origin, for example `http://localhost:3000`.

The app-level API contract uses `{ code, message, data }` for every business response. `message` is the only human-readable status field, and business payloads must live under `data`.

Sensitive `authorization` and `cookie` values are redacted from error logs.

Public adapters must stay free of token cookies and refresh behavior. This keeps prerender, SWR, crawlers, and CDN caches from being coupled to a visitor's session.

## Add SEO

Use `usePageSeo({ path, title, description })`. The composable adds title, description, canonical, Open Graph metadata, Twitter Card metadata, and alternate links for public `zh-CN` and `en-US` pages.

Automatic enhancements (no extra page props required):

- Twitter Card: `twitter:card=summary_large_image`, plus `twitter:title`, `twitter:description`, and `twitter:image`.
- Open Graph: `og:type` (`website` by default, `article` when `article` is passed), and `og:site_name` from `SITE_NAME`.
- Resolved titles: `og:title` and `twitter:title` always use the resolved title (`${title} · ${SITE_NAME}` when a page title is provided).
- Default OG image: `public/og-default.png` via `DEFAULT_SEO.ogImage` in `config/site.ts`.

Opt-in JSON-LD and verification:

| Parameter                                       | Default | Behavior                                                             |
| ----------------------------------------------- | ------- | -------------------------------------------------------------------- |
| `webPage?: boolean`                             | `false` | Emits WebPage JSON-LD                                                |
| `includeOrganization?: boolean`                 | `false` | Emits Organization JSON-LD (home page only in the starter)           |
| `article?: { title, description, publishedAt }` | —       | Emits Article JSON-LD and sets `og:type=article`                     |
| `siteVerification?: { baidu?, google? }`        | —       | Emits search-console verification meta tags when tokens are provided |

Home page example:

```typescript
const runtimeConfig = useRuntimeConfig()

usePageSeo({
  path: '/',
  title: t('home.title'),
  description: t('home.lead'),
  webPage: true,
  includeOrganization: true,
  siteVerification: {
    google: runtimeConfig.public.googleSiteVerification || undefined,
    baidu: runtimeConfig.public.baiduSiteVerification || undefined
  }
})
```

News detail example:

```typescript
usePageSeo({
  path: `/news/${slug}`,
  title: article.title,
  description: article.description,
  article: {
    title: article.title,
    description: article.description,
    publishedAt: article.publishedAt
  }
})
```

`WebPage` and `Organization` JSON-LD are implemented. `WebSite` JSON-LD remains a future addition when a real brand domain and richer site metadata are available.

`noindex` product pages keep canonical, OG, and Twitter metadata but skip alternate links.

`server/routes/sitemap.xml.ts` and `server/routes/robots.txt.ts` are generated from public route/content configuration. Keep product routes, sign-in, and sign-up pages out of sitemap and blocked in robots rules.

Environment placeholders for search-console verification:

```bash
NUXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
NUXT_PUBLIC_BAIDU_SITE_VERIFICATION=
```

Read these from `runtimeConfig.public` and pass them into `usePageSeo`. Do not hardcode verification tokens in page source.

## Channel Attribution

The starter persists marketing attribution parameters in `localStorage` through `app/utils/attribution-params.ts` and `app/plugins/attribution.client.ts`.

Supported keys include `utm_*`, `bd_vid`, `clickid`, `gclid`, `msclkid`, `fbclid`, and `ttclid`. Fork projects can append more keys to `ATTRIBUTION_KEY_PATTERNS`.

Storage strategy is **last-touch merge by key**:

- A later landing URL only overwrites keys present in that query.
- Keys not present in the new query are preserved.

Example:

1. Land on `/?utm_source=a&utm_medium=cpc`
2. Later land on `/?gclid=b`
3. Storage contains `utm_source`, `utm_medium`, and `gclid`

Capture behavior:

- The attribution plugin reads `router.currentRoute.value.query` on startup to cover first-load landings.
- `router.afterEach` covers later SPA navigations.

Registration example:

- `registerApi()` merges stored attribution into the request body before sending.
- Backend acceptance of these fields is a fork-specific API contract.
- Login conversion is not wired in v1; call `mergeAttributionIntoBody()` inside `loginApi()` in fork projects when needed.

Storage lifecycle:

- Attribution survives SPA navigation, full page refresh, and token refresh failure.
- Attribution is **not** cleared inside generic `reset()` or `clearAuthSession()`.
- Attribution is cleared only on explicit `logout()`.

Shared-device note:

- If user A lands with UTM params and never logs out, user B registering in the same browser may inherit those params. Fork projects should handle this with product-specific UX or cleanup rules if needed.

Manual checks:

```bash
# land with params, inspect localStorage key attribution_params
/?utm_source=test

# register request body should include stored attribution fields
```

## Analytics Plugin Slot

Analytics is disabled by default and loaded only on the client through `app/plugins/analytics.client.ts`.

Environment variables:

```bash
NUXT_PUBLIC_ANALYTICS_ENABLED=false
NUXT_PUBLIC_ANALYTICS_SCRIPT_SRC=
NUXT_PUBLIC_ANALYTICS_DEFER_MS=3000
```

v1 supports one external script URL injected after a timeout defer. It does **not** support a full GTM container bootstrap, inline `dataLayer` setup, or multi-script queues.

Guard behavior:

| Condition                                       | Result                                |
| ----------------------------------------------- | ------------------------------------- |
| `analyticsEnabled !== true`                     | Silent skip                           |
| enabled but `analyticsScriptSrc` is blank       | Silent skip                           |
| enabled with a valid script URL and relaxed CSP | Script loads after `analyticsDeferMs` |

When enabling analytics, update `script-src` in `nuxt.config.ts`. The default CSP blocks external scripts:

```txt
script-src 'self' 'unsafe-inline' https://www.googletagmanager.com;
```

Single-file GA4 scripts such as `https://www.googletagmanager.com/gtag/js?id=...` can use `NUXT_PUBLIC_ANALYTICS_SCRIPT_SRC`. A complete GTM container still requires inline bootstrap work outside v1.

Load failures caused by CSP or network errors are caught and logged with `console.warn`; they do not throw uncaught client errors.

## BasePicture

Use `BasePicture` for responsive hero or content images with optional WebP fallback:

```vue
<BasePicture
  src="/demo-hero.png"
  webp-src="/demo-hero.webp"
  alt="Product preview"
  width="960"
  height="540"
  loading="eager"
  fetchpriority="high"
  sizes="(min-width: 900px) 960px, 100vw"
/>
```

Provide `width`, `height`, and `sizes` on LCP-critical images. The starter keeps the home hero as CSS decoration and documents `BasePicture` instead of forcing a home-page UI change.

## Add Languages

The starter ships `zh-CN` and `en-US`. To add a language, update `SUPPORTED_LOCALES` and `SITE_LOCALE_PREFIX_MAP` in `config/site.ts`, extend `SITE_LANG_MAP` and locale modules in `i18n/index.ts`, then add routing/SEO tests.

Do not install `@nuxtjs/i18n` for this template. Language routing is intentionally handled by `locale.global.ts` and `useLocalePath.ts`. Public pages use URL prefixes such as `/en`; authenticated product pages stay language-neutral regardless of UI language. Use `useLanguageSwitch` or `UserAccountMenu` inside the product shell to change UI locale without changing product URLs.

## Theme Customization

Edit `config/theme.ts` and `app/assets/styles/tokens.scss` together. CSS variables are the preferred page styling API; pages should not hardcode brand colors, background colors, body text colors, or borders.

To disable dark mode, keep only light tokens, set `DEFAULT_THEME_MODE` to `light`, and remove the theme toggle in `AppHeader.vue`.

## Add Product Workspace And Editor

The starter ships a real product flow when paired with `nuxt-modern-starter-api`:

| Route                  | Layout    | Purpose                                                                                               |
| ---------------------- | --------- | ----------------------------------------------------------------------------------------------------- |
| `/workspace`           | `product` | Project list, loading/empty states, blank-project creation, delete, and navigation into the editor    |
| `/workspace/templates` | `product` | Theme templates placeholder (no API)                                                                  |
| `/docs/:id`            | `editor`  | Load project by `:id` (project id), resolve `documentId`, then load/save editor content with autosave |
| `/account`             | `product` | Session details, profile payload, and logout (via user menu)                                          |

API boundaries:

- Workspace adapters in `app/features/workspace/api.ts`: `fetchWorkspaceProjects()`, `createWorkspaceProject()`, `fetchWorkspaceProject()`, and `deleteWorkspaceProject()` via `createProductApiClient()`. `getWorkspaceDocPath(projectId)` returns `/docs/:id`.
- Editor adapters in `app/features/editor/api.ts`: `fetchEditorDocument()` and `saveEditorDocument()` via `createProductApiClient()`.
- Relative request paths are `/projects` and `/documents/:documentId`; `runtimeConfig.public.apiBase` already includes the `/api` prefix.
- Both use the backend envelope `{ code, message, data }` and retry once after a single-flight refresh on 401.

Current UI scope:

- The header create button navigates to `/docs/new`. The editor creates the project on first save through `createWorkspaceProject()` with the default title from i18n (`workspace.defaultTitle`).
- After a blank project is created, the editor replaces the route with `/docs/:id` for the new project id.
- Project cards link to the editor through `getWorkspaceDocPath()`. `slideCount` currently comes from project metadata and is not recalculated from document content.

Editor behavior:

- `/docs/:id` uses the `editor` layout and mounts `EditorWorkspace` with `@yanivjs/yaniv-editor`.
- Route param `:id` is the **project id**. The page calls `fetchWorkspaceProject(id)`, requires a non-null `documentId`, then loads/saves the linked document through editor APIs.
- Content autosaves after a 2-second debounce and flushes on route leave.
- The editor header includes language switching and `UserAccountMenu`; it is not a sidebar nav item.

Local full-stack defaults:

- Nuxt: `http://localhost:3000`
- API gateway: `http://localhost:2026/api`
- Backend `CORS_ORIGINS` must include `http://localhost:3000`

For Docker and Nginx deployment validation, see `docs/deployment.md`.

## Auth Extension Contract

Auth is implemented as an opt-in Bearer Token module for the current application API.

- Backend endpoints use the `/api` prefix and return the standard `{ code, message, data }` envelope. Auth calls use `~/api/auth` through `createAuthApiClient()`, and stores/pages consume token, user, and profile payloads from `data`.
- HTTP endpoint paths are centralized in `config/auth.ts`: `/register`, `/login`, `/refresh`, `/logout`, `/me`, and `/me/profile`. Frontend auth pages use `/sign-in` and `/sign-up`; `AUTH_REDIRECTS.login = '/sign-in'`.
- `POST /api/register` creates an account but does not log the user in. The sign-up page redirects users to sign-in after success.
- `POST /api/login` and `POST /api/refresh` return `accessToken` and `refreshToken`. Tokens are stored in JS-readable Nuxt cookies for client-side product workflows.
- `createAuthApiClient()` and `createProductApiClient()` may attach the access token for authenticated business requests. A 401 triggers a single-flight `POST /api/refresh` and retries the failed request once; refresh failure clears the local session.
- `app/stores/auth.ts` owns `user`, token cookies, `status`, `login`, `register`, `logout`, `fetchMe`, `refresh`, and `reset`.
- `app/composables/useAuth.ts` exposes the store plus `ensureSession()`, `can()`, and `hasRole()` for pages and middleware.
- `app/plugins/auth.ts` hydrates `/api/me` on startup when token cookies are present.
- Protected routes opt in with `definePageMeta({ middleware: 'auth' })`. Optional `route.meta.auth.roles` and `route.meta.auth.permissions` are already checked by the middleware.
- The backend currently has no RBAC fields in JWT or `/api/me`. Frontend roles and permissions default to empty arrays and should be populated in `normalizeAuthUser()` once the backend contract adds them.
- Development and production both use `NUXT_PUBLIC_API_BASE` to call the backend directly. Configure CORS on the backend or gateway when the API origin differs from the frontend origin.
