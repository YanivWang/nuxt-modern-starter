# Conventions

## Configuration Boundaries

- `runtimeConfig`: deployment-time values such as API hosts, environment (`appEnv`), and public site URL.
- `app/app.config.ts`: UI-level app defaults such as brand text, layout switches, and default theme mode.
- `config/site.ts`: site metadata, supported locales, navigation, and public page base paths.
- `config/auth.ts`: auth endpoint paths, cookie keys, token max ages, and auth route meta types.
- `config/routes.ts`: public/product path helpers and route rule sources for prerender, SWR, and CSR.
- `config/cache.ts`: SWR page-cache storage driver (`NUXT_CACHE_DRIVER`), evaluated at build time and consumed by `nitro.storage`.
- `config/theme.ts`: TypeScript design tokens and Ant Design Vue token mapping.
- `app/assets/styles/tokens/`: layered design tokens (`_variables.scss` for Sass build-time values, `_root.scss` for light `--app-*` CSS variables, `_dark.scss` for dark overrides).
- `app/assets/styles/tokens.ts`: runtime `cssVarTokens` map and `getCssVar` / `setCssVar` helpers.
- `app/assets/styles/patterns/`: reusable pattern classes — `_page.scss` (`.page-panel`, `.page-faq`), `_home.scss` (`.hero`, `.feature-card`), `_product.scss` (`.app-*`, `.workspace-card`), `_editor.scss` (`.editor-workspace*`).
- `app/assets/styles/main.scss`: global style entry mounted from `nuxt.config.ts`.

`runtimeConfig.public.siteUrl` should be set in production. Local development falls back to `http://localhost:3000`; production deployments should fail review if this remains unchanged.

Auth cookies are marked `secure` when `appEnv === 'production'` **or** `siteUrl` starts with `https://` (`requiresSecureCookie` in `app/utils/auth-session.ts`). The flag follows the actual transport rather than the environment label: `.env.test` ships `NUXT_PUBLIC_APP_ENV=test` with an `https://` site URL, and keying off the label alone would send its tokens without `Secure`. The tracked profiles set `NUXT_PUBLIC_APP_ENV` to `development` in `.env.dev` and `.env.e2e`, `test` in `.env.test`, and `production` in `.env.prod`; Docker Compose preserves the matching production and development values.

## Naming

Use PascalCase for Vue components, `use*` for composables, and typed named exports from `config`. Pages should assemble content and call shared helpers; they should not duplicate locale prefix, SEO URL, or API base URL logic.

## Page And Feature Boundaries

Public SEO routes live directly under `app/pages/[[language]]`. Logged-in product route entries live under `app/pages/workspace`, `app/pages/docs`, and top-level `app/pages/account.vue`. Do not nest product pages under `app/pages/[[language]]`.

Nuxt page files are route entries only. Keep them focused on `definePageMeta`, layout selection, auth middleware, SEO/noindex, route params, and mounting a feature component.

Top-level `app/components`, `app/composables`, and `app/stores` are for shared framework-level primitives. Feature-specific components, composables, stores, types, constants, and utilities belong under `app/features/<feature>`.

Use `app/features/<feature>/index.ts` as the feature public surface for pages. Features must not import other feature modules; cross-feature domain data belongs in shared `app/api/*` and `app/types/*` modules.

## Ant Design Vue

The starter uses `@ant-design-vue/nuxt` with `extractStyle: true`.

The active token mapping is in `config/theme.ts` and covers `colorPrimary`, `colorBgBase`, `colorTextBase`, `borderRadius`, and `fontFamily`.

Import Ant Design icons through `app/utils/antdIcon.ts` so only the SVGs a screen needs are bundled, instead of pulling in the full `@ant-design/icons-vue` package.

## Design Tokens

Prefer semantic CSS variables from `app/assets/styles/tokens/` (`--app-*` prefix). Do not hardcode brand colors, page backgrounds, body text, or border colors inside page components unless the value is local illustrative content.

When changing palette values, edit `config/theme-palette.json` and run `pnpm generate:theme`. `config/theme.ts` reads the same palette for Ant Design (`getAntdThemeToken`) and page CSS variables (`applyThemeCssVariables`, already wired in `useTheme()`). Generated `tokens/_variables.scss` / `_dark.scss` stay in sync via `pnpm generate:theme`. Use `patterns/_page.scss` for shared public-page blocks instead of duplicating panel/card/faq styles in page scoped CSS.

SFC authors may use Sass variables from `tokens/_variables.scss` (injected via `nuxt.config.ts` `vite.css.preprocessorOptions.scss.additionalData`). For JS runtime reads, import `cssVarTokens` from `~/assets/styles/tokens`.

## Requests

HTTP requests follow a flat, mainstream layout:

- `app/lib/http` owns the shared `$fetch` wrapper, response types, header helpers, envelope validation (`assertApiSuccess`), and error normalization.
- `app/api/clients.ts` exposes `createPublicApiClient()`, `createAuthApiClient()`, and the authenticated product default via `createProductApiClient()` in `app/api/auth.ts`.
- `app/api/public.ts`, `app/api/auth.ts`, and `app/api/workspace-project.ts` hold cross-feature business adapters. Pages should import from `~/api/public`, `~/api/auth`, or feature barrels, not raw backend URLs.
- Feature-only adapters live in `app/features/<feature>/api.ts` (for example editor documents). If two features need the same adapter or type, move it to `app/api/*` or `app/types/*` instead of importing across feature folders.

`createPublicApiClient()` is the default for public SEO/content data. It strips `authorization` and `cookie` headers, does not refresh sessions, and is safe for SSR/prerender/SWR paths.

`createAuthApiClient()` is the default for login, register, refresh, logout, `/me`, and profile requests.

`createProductApiClient()` is the default for authenticated workspace and editor workflows. Workspace project adapters such as `fetchWorkspaceProjects()` and `updateWorkspaceProject()` live in `app/api/workspace-project.ts`; editor-only adapters such as `fetchEditorDocument()` live in `app/features/editor/api.ts`. Use `getWorkspaceDocPath(projectId)` or `getWorkspaceNewDocPath()` for editor links.

Scenario clients decide their own headers. Public clients only keep request metadata such as `accept-language` and `x-request-id`; authenticated clients add Bearer tokens explicitly. Logs redact `authorization` and `cookie`.

Successful business responses must use `code: 200` in the `{ code, message, data }` envelope. The shared HTTP client rejects other business codes and throws a normalized failure with the backend `message`.

Public adapters must not read token cookies or call refresh endpoints. If a public page needs personalized data, put that personalized request behind a client-only authenticated component so the SEO HTML remains cache-safe.

Product routes (`/workspace/**`, `/docs/**`, `/account`) are client-rendered by default through `csrRouteRules` in `config/routes.ts`. Do not add localized product route rules such as `/en/workspace`; language choice inside the product app is UI state, not part of the authenticated product URL. If someone opens `/en/workspace`, locale and server middleware redirect to `/workspace` with 301.

Product sidebar navigation belongs in `app/features/product-shell/config.ts` through `productNavItems` and `productFooterNavItems` (footer includes a localized pricing link). Account settings navigation belongs in `app/features/account-shell/config.ts` through `accountNavItems`. Account access from the product shell lives in `UserAccountMenu`, not the product sidebar. Page-level auth and noindex are declared with `definePageMeta` and `usePageSeo`.

`useAsyncData()` is for page data that must be server-rendered and hydrated. It is **not** a request helper: it caches by key and, on a cache hit, returns the previous value without calling the handler again. Inside an event handler — a button click, a search box, a form submit — that means the user sees stale data and no request goes out.

```ts
// 页面数据：需要 SSR + hydration 复用
const { data } = await useAsyncData(
  () => `news-article:${slug}:${languageStore.currentLanguage}`,
  () => fetchLocalizedNewsArticle(slug, languageStore.currentLanguage)
)

// 事件里的读写：直接 await adapter，不要包 useAsyncData
const onSearch = async () => {
  results.value = await searchTemplates(keyword.value)
}
```

Keys must include every input the request depends on (slug, locale, id). Prefer a function key so it re-evaluates reactively, and pair it with `watch` when those inputs can change without a route change.

Auth redirect query values must stay on same-origin relative paths. Use `resolveSafeRedirectPath()` from `app/utils/safe-redirect.ts` instead of passing raw `route.query.redirect` to `router.push()`.

## SEO Server Routes

`server/routes/sitemap.xml.ts` and `server/routes/robots.txt.ts` are the canonical crawler entrypoints. Sitemap output should include public localized pages and public content details only. Product routes, sign-in, and sign-up pages stay `noindex` and must remain out of sitemap.

## Tests

Tests are layered, and the environment is opt-in per file rather than global:

| Directory         | Environment | Scope                                                                                        |
| ----------------- | ----------- | -------------------------------------------------------------------------------------------- |
| `tests/unit`      | happy-dom   | Pure functions, middleware decisions, adapters, config, static scans                         |
| `tests/nuxt`      | nuxt        | Behavior needing `useRuntimeConfig`, `useCookie`, `useNuxtApp`                               |
| `tests/component` | nuxt        | Real mounting via mountSuspended from @nuxt/test-utils; rendering and interaction assertions |
| `tests/e2e`       | Playwright  | Real browser against the production build, backed by `tests/e2e/stub-api`                    |

Files needing the Nuxt runtime declare it on their first line with `// @vitest-environment nuxt`. Do not switch the global default back to `nuxt`: every such file builds a full Nuxt instance in its own worker, and running a dozen of them in parallel starves the pure-function tests into timeouts — which shows up as "green individually, randomly red in full runs".

`hookTimeout` must stay explicitly raised. `setupNuxt()` runs inside `beforeAll` and its cold start exceeds Vitest's 10s default, which fails the whole file with `Hook timed out` and silently marks every case in it as skipped.

Coverage thresholds in `vitest.config.ts` are a ratchet: raise them, never lower them to make CI green. Thin Nitro entry points (`server/plugins`, `server/middleware`, `server/routes`) are excluded because they only execute inside a real server process; their logic lives in `server/utils` and `config`, which carry high thresholds, and their behavior is asserted by E2E.

Architecture boundaries are enforced by `pnpm depcruise` on the real dependency graph, and by `tests/unit/page-structure.test.ts` on source text. The overlap is deliberate: the graph catches re-export chains and transitive edges, the text scan catches patterns that have not become a dependency edge yet.

## Tooling And Formatting

Formatting and lint responsibilities are split on purpose:

| Tool           | Role                                                                                                         |
| -------------- | ------------------------------------------------------------------------------------------------------------ |
| Prettier       | Source of truth for JS/TS/Vue/Markdown/JSON/CSS/SCSS formatting                                              |
| ESLint         | Code quality and Vue semantics; markup self-closing rules are aligned with Prettier output                   |
| Stylelint      | SCSS/CSS/Vue style blocks only; does not format script or template markup                                    |
| Husky          | `lint-staged` on commit only; the full gate runs in CI (`.github/workflows/quality.yml`)                     |
| `pnpm quality` | Release gate: adds `format:check`, `i18n:check`, and `build` before `test` so tests can inspect build output |

Commit messages use Conventional Commits by meaning, not only by syntax: use `fix` for bug/security fixes, `docs` for documentation-only changes, `chore` for dependency/tooling maintenance, `test` for test-only changes, and `feat` only for user-visible product capability.

Commit flow for staged code files:

1. `prettier --write`
2. `eslint --fix --max-warnings 0`

Do not hand-edit Vue template void/empty tags into a style that Prettier will rewrite on commit. Empty elements such as `<img>`, `<source>`, `<slot>`, `<div>`, and `<span>` should stay in Prettier's self-closing form (`<tag />`) so ESLint and Prettier stay consistent.

`pnpm lint` runs with `--max-warnings 0`. Fix or align rules instead of ignoring formatting warnings in Vue templates.

## Safety and Accessibility

Do not log secrets, tokens, or cookies. Server-side logging goes through `server/utils/logger.ts`, never `console.*` directly: the logger owns level filtering and recursive key-based redaction, and calling `console.*` bypasses both. New credential-bearing field names must be added to `SENSITIVE_KEY_PATTERNS` in `config/observability.ts`, which is the single source for redaction.

Keep images sized and optimized before adding them to public pages.

Third-party analytics scripts should stay behind explicit env toggles. The starter ships an analytics plugin slot, but analytics remains disabled by default. When enabling it, relax `script-src` in `nuxt.config.ts` for the script origin and keep `connect-src` aligned with the analytics provider if needed.

The global CSP currently keeps `script-src 'unsafe-inline'` because prerendered and SWR-cached HTML includes executable inline scripts for `theme-init` and Nuxt runtime config. Do not switch to per-response nonces while keeping prerender/SWR caches; nonce reuse in cached HTML defeats the model. Removing `unsafe-inline` requires a separate build-time hash injection implementation and validation against generated HTML.

Channel attribution uses client-side `localStorage` only. It does not affect SSR, prerender, SWR, or CDN cache safety. Clear attribution only on explicit logout; do not tie attribution cleanup to generic auth reset paths.

Fork projects targeting EU or other consent-regulated regions must add their own cookie or consent banner (CMP). The starter does not ship a CMP.

Load third-party scripts only behind explicit project requirements. Interactive controls need accessible labels, visible focus states, and keyboard-friendly behavior.
