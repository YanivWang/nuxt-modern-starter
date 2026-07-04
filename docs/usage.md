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

Auth is not implemented in v0.1-core and there are no runtime placeholders. When a project needs auth, add it as an optional module with:

- `app/stores/auth.ts` for session state.
- `app/composables/useAuth.ts` for login/logout/session APIs.
- Route middleware only for protected business routes.
- Tests for SSR session loading and unauthorized redirects.

## Out of Scope

Analytics, CMS, payment, membership, uploads, more languages, Playwright E2E, and remote CI are not part of v0.1-core. Add them as project-specific modules after the starter core is stable.

## Cuttable Modules

- Remove i18n: delete `i18n`, `app/plugins/i18n.ts`, `app/middleware/locale.global.ts`, `app/stores/language.ts`, and simplify pages from `[[language]]`.
- Remove Pinia: delete `app/stores`, remove `@pinia/nuxt`, and replace store usage with local state.
- Remove Ant Design Vue: remove `@ant-design-vue/nuxt`, `ant-design-vue`, `a-config-provider`, and Ant components.
- Remove Docker/Nginx: delete `Dockerfile`, `.dockerignore`, `deploy/nginx.conf`, and docker scripts.
- Remove news examples: delete `config/content/news.ts`, news pages, and related sitemap entries.

After cutting modules, run `pnpm lint`, `pnpm stylelint`, `pnpm typecheck`, `pnpm test`, and `pnpm build`.
