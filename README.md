# Nuxt Modern Starter

Reusable Nuxt 4 starter for public websites, marketing pages, SEO surfaces, multilingual content sites, and lightweight SaaS frontends.

## Quick Start

```bash
corepack enable
pnpm install
pnpm dev
```

When pairing with `nuxt-modern-starter-api`, start the backend Docker stack first and keep `.env.dev` pointed at `http://localhost:2026/api`.

The quick-start target is `pnpm install && pnpm dev`: a new project should be able to run locally within 30 minutes after cloning, excluding full quality gates and Docker/Nginx validation.

## Verified Versions

| Tool                  | Version |
| --------------------- | ------- |
| Node                  | 22.22.3 |
| pnpm                  | 11.5.2  |
| Nuxt                  | 4.4.8   |
| vue-i18n              | 11.4.6  |
| @pinia/nuxt           | 0.11.3  |
| ant-design-vue        | 4.2.6   |
| @ant-design-vue/nuxt  | 1.4.6   |
| @yanivjs/yaniv-editor | 0.1.2   |
| Vitest                | 4.1.9   |

When upgrading dependencies, update this section and run at least:

```bash
pnpm lint
pnpm stylelint
pnpm typecheck
pnpm test
pnpm build
```

## Core Features

- Nuxt 4, TypeScript, pnpm, Pinia, Ant Design Vue, SCSS, and `vue-i18n`.
- Default-language routes without a prefix and English routes under `/en`.
- Shared `useLocalePath`, `usePageSeo`, `useTheme`, and scenario-specific API clients.
- Hybrid rendering: SSR for public pages, prerender for selected marketing routes, SWR for news, and CSR for product routes (`/workspace/**`, `/docs/**`, `/account`).
- Separate public SEO routes and logged-in product routes. Product URLs stay language-neutral; `/en/workspace`, `/en/docs/**`, and `/en/account` redirect to canonical paths without a locale prefix.
- Feature-first product modules under `app/features/*` for workspace, editor, product shell, templates, and future SaaS workflows.
- Opt-in Bearer Token auth module with sign-in, sign-up, logout, user menu, and protected-route examples.
- Product workspace at `/workspace`: list, create, and delete projects via `nuxt-modern-starter-api` (`GET/POST/DELETE /api/projects`).
- Theme templates placeholder at `/workspace/templates` (no API yet).
- Editor at `/docs/:id` (`:id` is the project id): resolves `documentId`, loads content with `GET /api/documents/:documentId`, and autosaves with `PATCH /api/documents/:documentId` through `@yanivjs/yaniv-editor`.
- Product account at `/account`: session details, profile payload, and logout (via user menu).
- Authenticated business responses use the shared `{ code, message, data }` envelope.
- Public pages for home, pricing, help, news list, news detail, sign-in, sign-up, and 404.
- Canonical, hreflang, OG metadata, Twitter Card metadata, noindex handling, Article JSON-LD, and home-page WebPage / Organization JSON-LD opt-ins.
- Channel attribution persistence, registration body merge, and deferred analytics plugin slot.
- `BasePicture` component for responsive image examples.
- Docker image, Compose samples, and Nginx reverse-proxy sample for Nitro node-server.

## Documentation

- `docs/architecture.md`: directory responsibilities, rendering strategy, and runtime flow.
- `docs/usage.md`: adding pages, requests, SEO, languages, themes, workspace/editor, and auth.
- `docs/conventions.md`: config boundaries, tokens, request, test, safety, and accessibility conventions.
- `docs/deployment.md`: local, Docker, Nginx deployment, and full-stack API pairing validation.

## Scripts

```bash
pnpm dev
pnpm dev:test
pnpm dev:prod
pnpm build
pnpm build:dev
pnpm build:test
pnpm build:prod
pnpm preview
pnpm lint
pnpm format
pnpm format:check
pnpm stylelint
pnpm typecheck
pnpm test
pnpm test:watch
pnpm quality
pnpm docker:build
pnpm docker:run
pnpm docker:up
pnpm docker:up:dev
pnpm docker:down
pnpm docker:down:dev
```

## Environment Layers

Environment files follow the Nuxt `--dotenv` convention:

- `.env.dev`: default local development layer, used by `pnpm dev` and `pnpm build:dev`.
- `.env.test`: test/staging layer, used by `pnpm dev:test` and `pnpm build:test`.
- `.env.prod`: production layer, used by `pnpm build`, `pnpm build:prod`, and `pnpm dev:prod`.

Keep real secrets out of committed env files. Runtime deployments should still inject final `NUXT_*` values from the platform, container, or process manager.

## Verification

Run the full local quality gate:

```bash
pnpm quality
```

`pnpm quality` runs lint, format:check, stylelint, typecheck, test, and build. Husky pre-commit keeps the faster subset for everyday commits.

Then verify deployment samples:

```bash
pnpm docker:build
pnpm docker:run
```

For Nginx, run a reverse proxy with `docker/nginx/gateway.docker.conf` pointing at the Nuxt node-server and verify `/_nuxt/` responses include the long-cache rule. This Docker/Nginx validation is not included in the 30-minute quick-start target.
