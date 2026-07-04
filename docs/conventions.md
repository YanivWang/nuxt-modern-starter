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

## Ant Design Vue

v0.1-core uses `@ant-design-vue/nuxt` with `extractStyle: true`. The frozen fallback standard is manual plugin installation plus `ConfigProvider` token injection if the module blocks install, SSR style extraction, build, types, or token mapping.

The active token mapping is in `config/theme.ts` and covers `colorPrimary`, `colorBgBase`, `colorTextBase`, `borderRadius`, and `fontFamily`.

## Design Tokens

Prefer semantic CSS variables from `tokens.scss`. Do not hardcode brand colors, page backgrounds, body text, or border colors inside page components unless the value is local illustrative content.

## Requests

`useApi` wraps Nuxt `useFetch`. The stable key format is `api:<method>:<path>:<body>`, and callers should pass a custom `key` only when they also keep all conflicting `useFetch` options consistent for that key.

Server-side external API header forwarding is allowlisted to `cookie`, `authorization`, `x-request-id`, and `accept-language`. Logs redact `authorization` and `cookie`.

## Tests

Use Nuxt test environment for composables, route middleware, server routes, and status code behavior. Pure utilities can use plain Vitest.

## Safety and Accessibility

Do not log secrets, tokens, or cookies. Keep images sized and optimized before adding them to public pages. Load third-party scripts only behind explicit project requirements. Interactive controls need accessible labels, visible focus states, and keyboard-friendly behavior.
