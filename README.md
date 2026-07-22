# Nuxt Modern Starter

Nuxt Modern Starter is a general-purpose SaaS frontend foundation. Built on Nuxt 4, it provides a public website, SEO, i18n, sign-in/sign-up, user workspace, project management, account center, editor workflow, request layer, theme system, and deployment samples. It is not tied to one business domain, and can be extended into AI apps, content tools, productivity products, creator tools, or lightweight business systems.

## Quick Start

```bash
corepack enable
pnpm install
pnpm dev
```

When pairing with `nuxt-modern-starter-api`, start the backend Docker stack from that repo first (commonly `pnpm docker:dev` there; this frontend uses `pnpm docker:up:dev` for its own Compose stack) and keep `.env.dev` pointed at `http://localhost:2026/api`. Adapter paths such as `/projects` are relative to that base URL, which already includes the `/api` prefix.

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
| @yanivjs/yaniv-editor | 0.1.4   |
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
- Hybrid rendering: default SSR for unconfigured public routes, prerender for selected marketing routes, SWR for news, and CSR for product routes (`/workspace/**`, `/docs/**`, `/account`). Pricing uses default SSR.
- On-demand SWR invalidation: `POST /api/revalidate` with `NUXT_REVALIDATE_SECRET` (webhook from the API after news changes).
- Separate public SEO routes and logged-in product routes. Product URLs stay language-neutral; `/en/workspace`, `/en/docs/**`, and `/en/account` redirect to canonical paths without a locale prefix.
- Feature-first product modules under `app/features/*` for workspace, editor, product shell, account shell, templates, and future SaaS workflows.
- Opt-in Bearer Token auth module with sign-in, sign-up, logout, user menu, safe redirect handling, and protected-route examples.
- Product workspace at `/workspace`: list, create (navigate to `/docs/new`), and delete projects via `nuxt-modern-starter-api` (`GET/POST/PATCH/DELETE /api/projects`). Dashboard prefetches editor route and feature chunk on idle.
- Theme templates placeholder at `/workspace/templates` (6 dashed cards + empty state, no API). Templates, AI generation, export, monetization, and domain-specific workflows are optional product extensions, not default requirements for the SaaS foundation.
- Editor at `/docs/:id` and `/docs/new` (`:id` is the project id or `new`): resolves `documentId`, loads content with `GET /api/documents/:documentId`, autosaves with `PATCH /api/documents/:documentId` (2s debounce, flush on route leave), and updates titles with `PATCH /api/projects/:projectId` through `@yanivjs/yaniv-editor` (PPT editor, `mode: edit`, `preset: full`).
- Product account at `/account`: dedicated account layout, profile payload, and logout (via user menu).
- Authenticated business responses use the shared `{ code, message, data }` envelope with automatic `code === 200` validation in the HTTP client.
- Public pages for home, pricing, about, help, news list, news detail, sign-in, sign-up, and 404.
- Canonical, hreflang, OG metadata, Twitter Card metadata, noindex handling, Article JSON-LD, and home-page WebPage / Organization JSON-LD opt-ins.
- Channel attribution persistence, registration body merge, and deferred analytics plugin slot.
- `BasePicture` renders the home hero product preview with responsive image attributes.
- Docker image, Compose samples, and Nginx reverse-proxy sample for Nitro node-server.

## Documentation

Full architecture handbook (VitePress, recommended for newcomers):

```bash
pnpm docs:dev      # http://localhost:5173
pnpm docs:build
pnpm docs:preview
pnpm docs:sync:check   # 校验 manifest / 头注释 / doc-claims 与源码一致
```

Source lives in `docs-site/`. Pushing changes under `docs-site/` to `main` triggers `.github/workflows/deploy-docs.yml` and publishes to GitHub Pages (`Settings → Pages → Source: GitHub Actions`).

Repository reference docs (linked from README / help page):

- `docs/architecture.md`: directory responsibilities, rendering strategy, and runtime flow.
- `docs/usage.md`: adding pages, requests, SEO, languages, themes, workspace/editor, and auth.
- `docs/conventions.md`: config boundaries, design tokens (`tokens/` + `patterns/`), request, test, safety, and accessibility conventions.
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
pnpm docs:sync:check
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

Key public variables:

```bash
NUXT_PUBLIC_SITE_URL=
NUXT_PUBLIC_API_BASE=
NUXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
NUXT_PUBLIC_BAIDU_SITE_VERIFICATION=
NUXT_PUBLIC_ANALYTICS_ENABLED=false
NUXT_PUBLIC_ANALYTICS_SCRIPT_SRC=
NUXT_PUBLIC_ANALYTICS_DEFER_MS=3000
```

Docker Compose also sets `NUXT_APP_ENV=production` or `NUXT_APP_ENV=dev`, which controls auth cookie `secure` behavior. See `docs/deployment.md` for the full variable table.

## Verification

Run the full local quality gate:

```bash
pnpm quality
```

`pnpm quality` runs lint, format:check, stylelint, typecheck, i18n:check, test, and build. Husky pre-commit keeps the faster subset for everyday commits.

Then verify deployment samples:

```bash
pnpm docker:build
pnpm docker:run
```

For Nginx, run a reverse proxy with `docker/nginx/gateway.docker.conf` pointing at the Nuxt node-server and verify `/_nuxt/` responses include the long-cache rule. This Docker/Nginx validation is not included in the 30-minute quick-start target.
