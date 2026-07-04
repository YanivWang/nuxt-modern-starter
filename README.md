# Nuxt Modern Starter

Reusable Nuxt 4 starter for public websites, marketing pages, SEO surfaces, multilingual content sites, and lightweight SaaS frontends.

## Quick Start

```bash
corepack enable
pnpm install
pnpm dev
```

The quick-start target is `pnpm install && pnpm dev`: a new project should be able to run locally within 30 minutes after cloning, excluding full quality gates and Docker/Nginx validation.

## Verified Versions

| Tool                 | Version |
| -------------------- | ------- |
| Node                 | 22.22.3 |
| pnpm                 | 11.5.2  |
| Nuxt                 | 4.4.8   |
| vue-i18n             | 11.4.6  |
| @pinia/nuxt          | 0.11.3  |
| ant-design-vue       | 4.2.6   |
| @ant-design-vue/nuxt | 1.4.6   |
| Vitest               | 4.1.9   |

When upgrading dependencies, update this section and run at least:

```bash
pnpm lint
pnpm stylelint
pnpm typecheck
pnpm test
pnpm build
```

## Delivery Scope

`v0.1-alpha` focuses on local dev/build and the main starter flow.

Full `v0.1-core` includes complete quality gates plus Docker build/run and Nginx reverse-proxy validation. Playwright E2E and remote CI are intentionally out of scope for v0.1.

## Core Features

- Nuxt 4, TypeScript, pnpm, Pinia, Ant Design Vue, SCSS, and `vue-i18n`.
- Default-language routes without a prefix and English routes under `/en`.
- Shared `useApi`, `useLocalePath`, `usePageSeo`, and `useTheme` composables.
- Public pages for home, pricing, help, news list, news detail, and 404.
- `robots.txt`, `sitemap.xml`, canonical, hreflang, OG metadata, and Article JSON-LD.
- Docker image and Nginx reverse-proxy sample for Nitro node-server.

## Documentation

- `docs/architecture.md`: directory responsibilities and runtime flow.
- `docs/usage.md`: adding pages, requests, SEO, languages, themes, and optional auth.
- `docs/conventions.md`: config boundaries, tokens, request, test, safety, and accessibility conventions.
- `docs/deployment.md`: local, Docker, and Nginx deployment validation.
- `docs/verification-record.md`: latest local verification results and Docker/Nginx status.

## Scripts

```bash
pnpm dev
pnpm build
pnpm preview
pnpm lint
pnpm stylelint
pnpm typecheck
pnpm test
pnpm docker:build
pnpm docker:run
```

## Full v0.1-core Verification

Run the full local quality gate:

```bash
pnpm lint
pnpm format:check
pnpm stylelint
pnpm typecheck
pnpm test
pnpm build
```

Then verify deployment samples:

```bash
pnpm docker:build
pnpm docker:run
```

For Nginx, run a reverse proxy with `deploy/nginx.conf` pointing at the Nuxt node-server and verify `/_nuxt/` responses include the long-cache rule. This Docker/Nginx validation is part of full `v0.1-core` and is not included in the 30-minute quick-start target.

Current local and Docker/Nginx verification results are recorded in `docs/verification-record.md`.
