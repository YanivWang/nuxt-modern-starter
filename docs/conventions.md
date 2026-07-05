# Conventions

## Configuration Boundaries

- `runtimeConfig`: deployment-time values such as API hosts, environment, and public site URL.
- `app/app.config.ts`: UI-level app defaults such as brand text, layout switches, and default theme mode.
- `config/site.ts`: site metadata, supported locales, navigation, and public page base paths.
- `config/theme.ts`: TypeScript design tokens and Ant Design Vue token mapping.
- `app/assets/styles/tokens.scss`: CSS variables consumed by Vue components and pages.

`runtimeConfig.public.siteUrl` should be set in production. Local development falls back to `http://localhost:3000`; production deployments should fail review if this remains unchanged.

## Naming

Use PascalCase for Vue components, `use*` for composables, and typed named exports from `config`. Pages should assemble content and call shared helpers; they should not duplicate locale prefix, SEO URL, or API base URL logic.

## Page And Feature Boundaries

Public SEO routes live directly under `app/pages/[[language]]`. Logged-in product routes live under `app/pages/[[language]]/app`; do not add new product pages such as editor, account, documents, templates, billing, or settings at the same level as public marketing pages.

Nuxt page files are route entries only. Keep them focused on `definePageMeta`, layout selection, auth middleware, SEO/noindex, route params, and mounting a feature component.

Top-level `app/components`, `app/composables`, and `app/stores` are for shared framework-level primitives. Feature-specific components, composables, stores, types, constants, and utilities belong under `app/features/<feature>`.

Use `app/features/<feature>/index.ts` as the feature public surface. Other features should import from that index instead of reaching into another feature's internal folders.

## Ant Design Vue

v0.1-core uses `@ant-design-vue/nuxt` with `extractStyle: true`. The frozen fallback standard is manual plugin installation plus `ConfigProvider` token injection if the module blocks install, SSR style extraction, build, types, or token mapping.

The active token mapping is in `config/theme.ts` and covers `colorPrimary`, `colorBgBase`, `colorTextBase`, `borderRadius`, and `fontFamily`.

## Design Tokens

Prefer semantic CSS variables from `tokens.scss`. Do not hardcode brand colors, page backgrounds, body text, or border colors inside page components unless the value is local illustrative content.

## Requests

Requests are split by responsibility:

- `app/api-core` owns common request types, header helpers, error normalization, log redaction, and typed `$fetch` client creation.
- `usePublicApi` is the default for public SEO/content data. It does not attach Bearer tokens and does not refresh sessions.
- `useEditorApi` is the default for logged-in editor/product workflows. It may attach the access token and retry once after a refresh.
- `useApi` is the generic authenticated business request entry. New domain APIs should prefer a clearer public/auth/editor adapter when the scenario is known.
- `app/apis/public`, `app/apis/auth`, and `app/apis/editor` expose business functions. Pages should not scatter raw backend URLs.

The stable key format is `api:<kind>:<method>:<path>:<body>`, and callers should pass a custom `key` only when they also keep all conflicting `useFetch` options consistent for that key.

Server-side external API header forwarding is allowlisted to `cookie`, `authorization`, `x-request-id`, and `accept-language`. Logs redact `authorization` and `cookie`.

Public adapters must not read token cookies or call refresh endpoints. If a public page needs personalized data, put that personalized request behind a client-only authenticated component so the SEO HTML remains cache-safe.

Product routes under `/app/**` are client-rendered by default through `csrRouteRules` in `config/routes.ts`. Public SEO routes and product CSR routes must stay in separate route lists.

## Tests

Use Nuxt test environment for composables, route middleware, server routes, and status code behavior. Pure utilities can use plain Vitest.

## Safety and Accessibility

Do not log secrets, tokens, or cookies. Keep images sized and optimized before adding them to public pages. Load third-party scripts only behind explicit project requirements. Interactive controls need accessible labels, visible focus states, and keyboard-friendly behavior.
