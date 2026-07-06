# Conventions

## Configuration Boundaries

- `runtimeConfig`: deployment-time values such as API hosts, environment, and public site URL.
- `app/app.config.ts`: UI-level app defaults such as brand text, layout switches, and default theme mode.
- `config/site.ts`: site metadata, supported locales, navigation, and public page base paths.
- `config/auth.ts`: auth endpoint paths, cookie keys, token max ages, and auth route meta types.
- `config/routes.ts`: public/product path helpers and route rule sources for prerender, SWR, and CSR.
- `config/theme.ts`: TypeScript design tokens and Ant Design Vue token mapping.
- `app/assets/styles/tokens.scss`: CSS variables consumed by Vue components and pages.

`runtimeConfig.public.siteUrl` should be set in production. Local development falls back to `http://localhost:3000`; production deployments should fail review if this remains unchanged.

## Naming

Use PascalCase for Vue components, `use*` for composables, and typed named exports from `config`. Pages should assemble content and call shared helpers; they should not duplicate locale prefix, SEO URL, or API base URL logic.

## Page And Feature Boundaries

Public SEO routes live directly under `app/pages/[[language]]`. Logged-in product route entries live under `app/pages/workspace`, `app/pages/docs`, and top-level `app/pages/account.vue`. Do not nest product pages under `app/pages/[[language]]` or reintroduce an `/app/**` prefix.

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

Requests are split by responsibility:

- `app/api-core` owns common request types, header helpers, error normalization, log redaction, and typed `$fetch` client creation.
- `createPublicApiClient()` is the default for public SEO/content data. It strips `authorization` and `cookie` headers, does not refresh sessions, and is safe for SSR/prerender/SWR paths.
- `createAuthApiClient()` is the default for login, register, refresh, logout, `/me`, and profile requests.
- `createProductApiClient()` is the default factory for authenticated workspace/project and editor document workflows. Feature adapters such as `fetchWorkspaceProjects()`, `createWorkspaceProject()`, `fetchWorkspaceProject()`, and `deleteWorkspaceProject()` should call it instead of pages calling raw URLs. Editor document adapters in `app/apis/editor/document.ts` also call `createProductApiClient()` directly. Use `getWorkspaceDocPath(projectId)` for editor links.
- `app/apis/public`, `app/apis/auth`, `app/apis/product`, and `app/apis/editor` expose business functions or client factories. Pages should not scatter raw backend URLs.

Scenario clients decide their own headers. Public clients only keep request metadata such as `accept-language` and `x-request-id`; authenticated clients add Bearer tokens explicitly. Logs redact `authorization` and `cookie`.

Public adapters must not read token cookies or call refresh endpoints. If a public page needs personalized data, put that personalized request behind a client-only authenticated component so the SEO HTML remains cache-safe.

Product routes (`/workspace/**`, `/docs/**`, `/account`) are client-rendered by default through `csrRouteRules` in `config/routes.ts`. Do not add localized product route rules such as `/en/workspace`; language choice inside the product app is UI state, not part of the authenticated product URL. If someone opens `/en/workspace`, locale and server middleware redirect to `/workspace` with 301.

Product sidebar navigation belongs in `app/features/product-shell/config.ts` through `productNavItems` and `productFooterNavItems`. Account access belongs in `UserAccountMenu`, not the sidebar. Page-level auth and noindex are declared with `definePageMeta` and `usePageSeo`.

## SEO Server Routes

`server/routes/sitemap.xml.ts` and `server/routes/robots.txt.ts` are the canonical crawler entrypoints. Sitemap output should include public localized pages and public content details only. Product routes, sign-in, and sign-up pages stay `noindex` and must remain out of sitemap.

## Tests

Use Nuxt test environment for composables, route middleware, server routes, and status code behavior. Pure utilities can use plain Vitest.

## Safety and Accessibility

Do not log secrets, tokens, or cookies. Keep images sized and optimized before adding them to public pages.

Third-party analytics scripts should stay behind explicit env toggles. The starter ships an analytics plugin slot, but analytics remains disabled by default. When enabling it, relax `script-src` in `nuxt.config.ts` for the script origin and keep `connect-src` aligned with the analytics provider if needed.

Channel attribution uses client-side `localStorage` only. It does not affect SSR, prerender, SWR, or CDN cache safety. Clear attribution only on explicit logout; do not tie attribution cleanup to generic auth reset paths.

Fork projects targeting EU or other consent-regulated regions must add their own cookie or consent banner (CMP). The starter does not ship a CMP.

Load third-party scripts only behind explicit project requirements. Interactive controls need accessible labels, visible focus states, and keyboard-friendly behavior.
