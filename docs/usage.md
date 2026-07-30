# Usage

## Release Quality Gate

Before tagging, deploying, or running `pnpm docker:up`, run the full local quality gate:

```bash
pnpm quality
```

`pnpm quality` runs `lint`, `format:check`, `stylelint`, `typecheck`, `i18n:check`, `build`, and `test`. Build runs before test so output-budget tests inspect the latest `.output` assets. Husky pre-commit still runs the faster subset (`lint-staged`, then `lint`, `stylelint`, `typecheck`, `test`) on every commit and intentionally skips `format:check`, `i18n:check`, and `build` to keep day-to-day commits fast.

Typical release flow:

```bash
pnpm quality
pnpm docker:up
```

`pnpm build` reads the tracked `.env.prod` baseline. Sitemap generation falls back to local slugs when the content API is unavailable, so the quality gate does not depend on a live backend.

## Add a Page

Create public SEO pages directly under `app/pages/[[language]]`. Use `localePath()` for internal links and call `usePageSeo()` with the unprefixed canonical path.

When a page should be public, add its base path to `PUBLIC_PAGE_PATHS` in `config/site.ts`. Sign-in and sign-up stay out of this list because they are noindex auth pages. If it needs prerendering or SWR behavior, update `config/routes.ts` so routeRules and hreflang remain synchronized.

Create logged-in product pages under `app/pages/workspace`, `app/pages/docs`, or top-level `app/pages/account.vue`. Keep links, canonical paths, and route config under language-neutral product URLs (`/workspace`, `/docs/:id`, `/account`). Product pages should set the `product`, `editor`, or `account` layout, opt in to auth middleware when required, set `noindex`, and mount a feature component from `app/features/*`.

Do not add product pages beside public marketing pages under `app/pages/[[language]]`. Product routes are client-rendered by default through `csrRouteRules` in `config/routes.ts`.

Register sidebar entries in `app/features/product-shell/config.ts` through `productNavItems` and `productFooterNavItems` before adding workspace links. Account settings use `app/features/account-shell/config.ts` through `accountNavItems` when extending the account layout. Do not create localized product links such as `/en/workspace`; locale middleware and server middleware redirect those back to canonical product paths. Account access belongs in `UserAccountMenu`, not the product sidebar.

Keep the default product loop narrow: account -> workspace -> project -> editor -> autosave. Templates, AI generation, export, asset, membership, credit, order, payment, and other domain-specific flows are optional product extensions. Do not introduce organization, team, invite, multi-tenant workspace permissions, collaboration, or enterprise publishing systems into the default architecture unless the project explicitly chooses that product direction.

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

Use the feature `index.ts` as the public export surface for Nuxt pages. Features should not import other feature modules; cross-feature adapters and types belong in shared `app/api/*` and `app/types/*`.

Keep top-level `app/components`, `app/composables`, and `app/stores` for shared primitives only.

For this starter, new feature modules should serve the chosen SaaS product workflow. Good optional examples are `generation`, `exports`, `assets`, richer `templates`, or monetization modules such as `membership`, `credits`, `orders`, and `payments` when they are needed by the product loop. Avoid using team, organization, invite, collaboration, or enterprise permission modules as default examples.

## Add Requests

Choose the request entrypoint by page and data ownership:

- Public SEO, marketing, help, pricing, news, and FAQ data belongs in `~/api/public`. Use local typed content there (`getFaqItems()` reads `config/content/faq.ts`), or call `createPublicApiClient()` inside the adapter for token-free backend requests such as `fetchNewsArticles()`, `fetchLocalizedNewsArticle()`, and `fetchPricingPage()`.
- Sign-in, sign-up, refresh, logout, `/me`, and profile requests belong in `~/api/auth` (`fetchProfileApi()`, `updateProfileApi()`).
- Workspace project requests belong in `~/api/workspace-project` via `fetchWorkspaceProjects()`, `createWorkspaceProject()`, `fetchWorkspaceProject()`, `updateWorkspaceProject()`, and `deleteWorkspaceProject()` (paths `/projects`, `/projects/:projectId`). Use `getWorkspaceDocPath(projectId)` or `getWorkspaceNewDocPath()` when linking to the editor route.
- Editor document requests belong in `~/features/editor/api.ts` via `fetchEditorDocument()` and `saveEditorDocument()` (paths `/documents/:documentId`). These call `createProductApiClient()` from `~/api/auth`.
- Editor media uploads belong in `~/features/editor/upload-api.ts`: images via `uploadImages()` (`POST /uploads`), videos via large-file chunked upload (`/uploads/large/*`). Wire them into `YanivEditor` through `useEditorMediaUpload()` as `:upload-image` / `:upload-video`. Returned `/uploads/...` paths are resolved to absolute URLs against the API origin (strip `/api` from `NUXT_PUBLIC_API_BASE`).
- Do not add a generic catch-all request composable. Add a named public, auth, product, editor, or feature client when a new request scenario appears.

All request helpers use `runtimeConfig.public.apiBase` in both SSR and browser code, so `NUXT_PUBLIC_API_BASE` should point directly to the real backend API origin, for example `https://api.example.com/api`.

Local full-stack development with `nuxt-modern-starter-api` Docker defaults to:

- Nuxt app: `http://localhost:3000`
- API gateway: `http://localhost:2027/api`
- Backend `CORS_ORIGINS` must include the Nuxt origin, for example `http://localhost:3000`.

The app-level API contract uses `{ code, message, data }` for every business response. `message` is the only human-readable status field, and business payloads must live under `data`. The shared HTTP client validates `code === 200` through `assertApiSuccess()` and throws a normalized failure otherwise.

Sensitive `authorization` and `cookie` values are redacted from error logs.

Public adapters must stay free of token cookies and refresh behavior. This keeps prerender, SWR, crawlers, and CDN caches from being coupled to a visitor's session.

## Add SEO

Use `usePageSeo({ path, title, description })`. The composable adds title, description, canonical, Open Graph metadata, Twitter Card metadata, and alternate links for every locale in `SUPPORTED_LOCALES`.

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

## Add Languages

The starter ships all locales listed in `SUPPORTED_LOCALES`. To add a language, update `SUPPORTED_LOCALES`, `SITE_LOCALE_PREFIX_MAP`, `SITE_HREFLANG_MAP`, and `SITE_LOCALE_OPTIONS` in `config/site.ts`, register its resolver in `i18n/index.ts`, add `i18n/<locale>/modules/*.json`, then run the locale checks and routing/SEO tests.

Do not install `@nuxtjs/i18n` for this template. Language routing is intentionally handled by `locale.global.ts` and `useLocalePath.ts`. Public pages use URL prefixes such as `/en`; authenticated product pages stay language-neutral regardless of UI language. Use `useLanguageSwitch` or `UserAccountMenu` inside the product shell to change UI locale without changing product URLs.

## Theme Customization

The style system is split into Ant Design component tokens and page-level CSS variables:

| Layer            | Location                                             | Role                                                     |
| ---------------- | ---------------------------------------------------- | -------------------------------------------------------- |
| Palette source   | `config/theme-palette.json`                          | Single source for brand and semantic colors              |
| Ant Design       | `config/theme.ts`                                    | `getAntdThemeToken()` for ConfigProvider (reads palette) |
| Page CSS vars    | `app/assets/styles/tokens/_root.scss` + `_dark.scss` | `--app-*` variables for pages and components             |
| Sass build-time  | `app/assets/styles/tokens/_variables.scss`           | `$spacing-*`, `$color-*` for SCSS (generated)            |
| Runtime JS       | `app/assets/styles/tokens.ts`                        | `cssVarTokens`, `getCssVar`, `setCssVar`                 |
| Public patterns  | `app/assets/styles/patterns/_page.scss`              | `.page-panel`, `.page-faq`, etc.                         |
| Product patterns | `app/assets/styles/patterns/_product.scss`           | `.workspace-card`, `.app-shell-nav`, etc.                |

When changing colors, edit `config/theme-palette.json` and run `pnpm generate:theme`. Do not hand-edit `_variables.scss` or `_dark.scss`. Add derived tokens (gradients, alpha, typography) in `_root.scss` when needed. CSS variables are the preferred page styling API; pages should not hardcode brand colors, background colors, body text colors, or borders. `stylelint` enforces `color-no-hex` under `app/components`, `app/features`, `app/pages`, and `app/layouts`.

Theme mode is applied with `html[data-theme='light'|'dark']` via `useTheme()`. On the client, `useTheme()` also calls `applyThemeCssVariables()` so Ant Design tokens and `--app-*` base colors share the same `theme-palette.json` source at runtime (already implemented). Global styles load from `app/assets/styles/main.scss`.

See `docs-site/tech-stack/styles.md` for the full `--app-*` token catalog and product pattern guide.

To disable dark mode, remove dark overrides from `tokens/index.scss`, set `DEFAULT_THEME_MODE` to `light`, and remove the theme toggle in `AppHeader.vue`.

## Environment Variables

Committed dotenv layers (`.env.dev`, `.env.test`, `.env.prod`) provide non-secret defaults. Runtime platforms should override them with `NUXT_*` values.

| Variable                               | Purpose                                                                       |
| -------------------------------------- | ----------------------------------------------------------------------------- |
| `NUXT_PUBLIC_SITE_URL`                 | Canonical site origin for SEO, sitemap, and robots                            |
| `NUXT_PUBLIC_API_BASE`                 | Backend API origin including `/api` prefix                                    |
| `NUXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Google Search Console verification token                                      |
| `NUXT_PUBLIC_BAIDU_SITE_VERIFICATION`  | Baidu verification token                                                      |
| `NUXT_PUBLIC_ANALYTICS_ENABLED`        | Must be exactly `true` to enable analytics                                    |
| `NUXT_PUBLIC_ANALYTICS_SCRIPT_SRC`     | Single deferred third-party script URL                                        |
| `NUXT_PUBLIC_ANALYTICS_DEFER_MS`       | Client defer before loading analytics script                                  |
| `NUXT_APP_ENV`                         | Controls auth cookie `secure` flag; Docker Compose sets `production` or `dev` |

See `docs/deployment.md` for deployment-specific notes and full-stack pairing defaults.

## Add Product Workspace And Editor

The starter ships a real product flow when paired with `nuxt-modern-starter-api`:

| Route                  | Layout    | Purpose                                                                                                  |
| ---------------------- | --------- | -------------------------------------------------------------------------------------------------------- |
| `/workspace`           | `product` | Project list, loading/empty states, create button to `/docs/new`, delete, and navigation into the editor |
| `/workspace/templates` | `product` | Optional theme templates placeholder (no API)                                                            |
| `/docs/:id`            | `editor`  | Load project by `:id` (project id), resolve `documentId`, then load/save editor content with autosave    |
| `/docs/new`            | `editor`  | Draft editor route; creates project and document on first save, then replaces route with `/docs/:id`     |
| `/account`             | `account` | Profile payload, avatar, extended profile fields, and logout (via user menu)                             |

API boundaries:

- Workspace adapters in `app/api/workspace-project.ts`: `fetchWorkspaceProjects()`, `createWorkspaceProject()`, `fetchWorkspaceProject()`, `updateWorkspaceProject()`, and `deleteWorkspaceProject()` via `createProductApiClient()`. `getWorkspaceDocPath(projectId)` returns `/docs/:id`; `getWorkspaceNewDocPath()` returns `/docs/new`.
- Editor adapters in `app/features/editor/api.ts`: `fetchEditorDocument()` and `saveEditorDocument()` via `createProductApiClient()`.
- Relative request paths are `/projects` and `/documents/:documentId`; `runtimeConfig.public.apiBase` already includes the `/api` prefix.
- Both use the backend envelope `{ code, message, data }` and retry once after a single-flight refresh on 401.

Current UI scope:

- The header create button navigates to `/docs/new` (does not call the API immediately). `WorkspaceDashboard` prefetches the editor route on idle or hover/focus for faster first paint.
- The editor creates the project on first non-blank save through `createWorkspaceProject()` with the default title from i18n (`workspace.defaultTitle`), then saves initial content and replaces the route with `/docs/:id`.
- Project cards link to the editor through `getWorkspaceDocPath()`. Cards show decorative accent thumbnails and formatted `updatedAt`. Share, download, and favorite buttons on cards are UI-only placeholders without backend APIs.
- Templates, AI generation, export, asset management, membership, credits, orders, and payments should remain optional product extensions until the chosen SaaS workflow or monetization path actually needs them.

Editor behavior:

- `/docs/:id` and `/docs/new` use the minimal `editor` layout and mount `EditorWorkspace` with `@yanivjs/yaniv-editor` (`mode: edit`, `preset: full`, locale from `languageStore`).
- Route param `:id` is the **project id** (or `new` via `WORKSPACE_NEW_PROJECT_ID`). The page keeps `cachedProject` to avoid loading flicker. Existing projects call `fetchWorkspaceProject(id)`, require a non-null `documentId`, then load/save the linked document through editor APIs.
- Draft mode (`/docs/new`) skips project fetch; first non-blank content triggers `createWorkspaceProject()` + initial `saveEditorDocument()`, then `router.replace()` to `/docs/:id`.
- Content autosaves after a 2-second debounce and flushes on route leave (`onBeforeRouteLeave`). Title edits persist through both `saveEditorDocument()` and `updateWorkspaceProject()`.
- The editor header (`EditorWorkspaceHeader`) includes back-to-workspace, inline title editing, autosave status, language switching, and `UserAccountMenu`; it is not a sidebar nav item.

Account behavior:

- `/account` uses the `account` layout with `AccountShell` and mounts `AccountPage`.
- Profile data loads through `fetchProfileApi()`; extended profile fields render as key-value rows. API failures show an alert with retry. Logout is available on this page and via `UserAccountMenu`; both call `authStore.logout()` to clear attribution params and session state, then `router.push(localePath('/'))` to return to the localized home page.

Local full-stack defaults:

- Nuxt: `http://localhost:3000`
- API gateway: `http://localhost:2027/api`
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
- Login redirect targets must stay on same-origin relative paths. Use `resolveSafeRedirectPath()` from `app/utils/safe-redirect.ts` on the sign-in page instead of passing raw `route.query.redirect` to `router.push()`.
- The backend currently has no RBAC fields in JWT or `/api/me`. Frontend roles and permissions default to empty arrays and should be populated in `normalizeAuthUser()` once the backend contract adds them.
- Development and production both use `NUXT_PUBLIC_API_BASE` to call the backend directly. Configure CORS on the backend or gateway when the API origin differs from the frontend origin.
- Auth cookies use `secure: true` when `runtimeConfig.public.appEnv === 'production'`. Docker Compose sets `NUXT_APP_ENV=production` for the production stack.
