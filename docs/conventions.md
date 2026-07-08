# Conventions

## Configuration Boundaries

- `runtimeConfig`: deployment-time values such as API hosts, environment (`appEnv`), and public site URL.
- `app/app.config.ts`: UI-level app defaults such as brand text, layout switches, and default theme mode.
- `config/site.ts`: site metadata, supported locales, navigation, and public page base paths.
- `config/auth.ts`: auth endpoint paths, cookie keys, token max ages, and auth route meta types.
- `config/routes.ts`: public/product path helpers and route rule sources for prerender, SWR, and CSR.
- `config/theme.ts`: TypeScript design tokens and Ant Design Vue token mapping.
- `app/assets/styles/tokens.scss`: CSS variables consumed by Vue components and pages.

`runtimeConfig.public.siteUrl` should be set in production. Local development falls back to `http://localhost:3000`; production deployments should fail review if this remains unchanged.

`runtimeConfig.public.appEnv` controls auth cookie `secure` behavior. Local `.env.*` files leave it at the default `development`; Docker Compose sets `NUXT_APP_ENV=production` for the production stack and `NUXT_APP_ENV=dev` for the development stack. Real HTTPS login flows require `appEnv === 'production'`.

## Naming

Use PascalCase for Vue components, `use*` for composables, and typed named exports from `config`. Pages should assemble content and call shared helpers; they should not duplicate locale prefix, SEO URL, or API base URL logic.

## Page And Feature Boundaries

Public SEO routes live directly under `app/pages/[[language]]`. Logged-in product route entries live under `app/pages/workspace`, `app/pages/docs`, and top-level `app/pages/account.vue`. Do not nest product pages under `app/pages/[[language]]`.

Nuxt page files are route entries only. Keep them focused on `definePageMeta`, layout selection, auth middleware, SEO/noindex, route params, and mounting a feature component.

Top-level `app/components`, `app/composables`, and `app/stores` are for shared framework-level primitives. Feature-specific components, composables, stores, types, constants, and utilities belong under `app/features/<feature>`.

Use `app/features/<feature>/index.ts` as the feature public surface. Other features should import from that index instead of reaching into another feature's internal folders.

## Ant Design Vue

The starter uses `@ant-design-vue/nuxt` with `extractStyle: true`.

The active token mapping is in `config/theme.ts` and covers `colorPrimary`, `colorBgBase`, `colorTextBase`, `borderRadius`, and `fontFamily`.

Import Ant Design icons through `app/utils/antdIcon.ts` so only the SVGs a screen needs are bundled, instead of pulling in the full `@ant-design/icons-vue` package.

## Design Tokens

Prefer semantic CSS variables from `tokens.scss`. Do not hardcode brand colors, page backgrounds, body text, or border colors inside page components unless the value is local illustrative content.

## Requests

HTTP requests follow a flat, mainstream layout:

- `app/lib/http` owns the shared `$fetch` wrapper, response types, header helpers, envelope validation (`assertApiSuccess`), and error normalization.
- `app/api/clients.ts` exposes `createPublicApiClient()`, `createAuthApiClient()`, and the authenticated product default via `createProductApiClient()` in `app/api/auth.ts`.
- `app/api/public.ts` and `app/api/auth.ts` hold cross-feature business adapters. Pages should import from `~/api/public` or `~/api/auth`, not raw backend URLs.
- Feature-only adapters live in `app/features/<feature>/api.ts` (for example workspace projects and editor documents).

`createPublicApiClient()` is the default for public SEO/content data. It strips `authorization` and `cookie` headers, does not refresh sessions, and is safe for SSR/prerender/SWR paths.

`createAuthApiClient()` is the default for login, register, refresh, logout, `/me`, and profile requests.

`createProductApiClient()` is the default for authenticated workspace and editor workflows. Workspace adapters such as `fetchWorkspaceProjects()`, `updateWorkspaceProject()`, and editor adapters such as `fetchEditorDocument()` should call it instead of pages calling raw URLs. Use `getWorkspaceDocPath(projectId)` or `getWorkspaceNewDocPath()` for editor links.

Scenario clients decide their own headers. Public clients only keep request metadata such as `accept-language` and `x-request-id`; authenticated clients add Bearer tokens explicitly. Logs redact `authorization` and `cookie`.

Successful business responses must use `code: 200` in the `{ code, message, data }` envelope. The shared HTTP client rejects other business codes and throws a normalized failure with the backend `message`.

Public adapters must not read token cookies or call refresh endpoints. If a public page needs personalized data, put that personalized request behind a client-only authenticated component so the SEO HTML remains cache-safe.

Product routes (`/workspace/**`, `/docs/**`, `/account`) are client-rendered by default through `csrRouteRules` in `config/routes.ts`. Do not add localized product route rules such as `/en/workspace`; language choice inside the product app is UI state, not part of the authenticated product URL. If someone opens `/en/workspace`, locale and server middleware redirect to `/workspace` with 301.

Product sidebar navigation belongs in `app/features/product-shell/config.ts` through `productNavItems` and `productFooterNavItems` (footer includes a localized pricing link). Account settings navigation belongs in `app/features/account-shell/config.ts` through `accountNavItems`. Account access from the product shell lives in `UserAccountMenu`, not the product sidebar. Page-level auth and noindex are declared with `definePageMeta` and `usePageSeo`.

Auth redirect query values must stay on same-origin relative paths. Use `resolveSafeRedirectPath()` from `app/utils/safe-redirect.ts` instead of passing raw `route.query.redirect` to `router.push()`.

## SEO Server Routes

`server/routes/sitemap.xml.ts` and `server/routes/robots.txt.ts` are the canonical crawler entrypoints. Sitemap output should include public localized pages and public content details only. Product routes, sign-in, and sign-up pages stay `noindex` and must remain out of sitemap.

## Tests

Use Nuxt test environment for composables, route middleware, server routes, and status code behavior. Pure utilities can use plain Vitest.

## Tooling And Formatting

Formatting and lint responsibilities are split on purpose:

| Tool           | Role                                                                                         |
| -------------- | -------------------------------------------------------------------------------------------- |
| Prettier       | Source of truth for JS/TS/Vue/Markdown/JSON/CSS/SCSS formatting                              |
| ESLint         | Code quality and Vue semantics; markup self-closing rules are aligned with Prettier output   |
| Stylelint      | SCSS/CSS/Vue style blocks only; does not format script or template markup                    |
| Husky          | `lint-staged` on commit, then full `pnpm lint`, `stylelint`, `typecheck`, and `test`         |
| `pnpm quality` | Release gate: adds `format:check`, `i18n:check`, and `build` on top of the pre-commit subset |

Commit flow for staged code files:

1. `prettier --write`
2. `eslint --fix --max-warnings 0`

Do not hand-edit Vue template void/empty tags into a style that Prettier will rewrite on commit. Empty elements such as `<img>`, `<source>`, `<slot>`, `<div>`, and `<span>` should stay in Prettier's self-closing form (`<tag />`) so ESLint and Prettier stay consistent.

`pnpm lint` runs with `--max-warnings 0`. Fix or align rules instead of ignoring formatting warnings in Vue templates.

## Safety and Accessibility

Do not log secrets, tokens, or cookies. Keep images sized and optimized before adding them to public pages.

Third-party analytics scripts should stay behind explicit env toggles. The starter ships an analytics plugin slot, but analytics remains disabled by default. When enabling it, relax `script-src` in `nuxt.config.ts` for the script origin and keep `connect-src` aligned with the analytics provider if needed.

Channel attribution uses client-side `localStorage` only. It does not affect SSR, prerender, SWR, or CDN cache safety. Clear attribution only on explicit logout; do not tie attribution cleanup to generic auth reset paths.

Fork projects targeting EU or other consent-regulated regions must add their own cookie or consent banner (CMP). The starter does not ship a CMP.

Load third-party scripts only behind explicit project requirements. Interactive controls need accessible labels, visible focus states, and keyboard-friendly behavior.
