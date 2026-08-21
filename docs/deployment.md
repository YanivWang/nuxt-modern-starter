# Deployment

## Default Target

The default deployment target is Nitro `node-server`. Build output is started with:

```bash
node .output/server/index.mjs
```

Production environment variables are injected at container runtime. Do not copy `.env.prod` or real secrets into the Docker image.

## Environment Layers

Local commands load explicit Nuxt dotenv files:

```bash
pnpm dev        # .env.dev
pnpm dev:test   # .env.test
pnpm dev:prod   # .env.prod
pnpm build      # .env.prod
pnpm build:dev  # .env.dev
pnpm build:test # .env.test
pnpm build:prod # .env.prod
```

The three env files are intentionally committed as starter baselines. Keep them limited to non-secret defaults; production secrets must still be supplied by the deployment platform, container runtime, or process manager.

### Runtime variables

| Variable                               | Purpose                                                               | Local default                                                            |
| -------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `NUXT_PUBLIC_SITE_URL`                 | Canonical site origin for SEO, sitemap, and robots                    | `http://localhost:3000`                                                  |
| `NUXT_PUBLIC_API_BASE`                 | Backend API origin including `/api` prefix                            | `http://localhost:2027/api`                                              |
| `NUXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Google Search Console verification token                              | empty                                                                    |
| `NUXT_PUBLIC_BAIDU_SITE_VERIFICATION`  | Baidu verification token                                              | empty                                                                    |
| `NUXT_PUBLIC_ANALYTICS_ENABLED`        | Must be exactly `true` to enable analytics plugin                     | `false`                                                                  |
| `NUXT_PUBLIC_ANALYTICS_SCRIPT_SRC`     | Single deferred third-party script URL                                | empty                                                                    |
| `NUXT_PUBLIC_ANALYTICS_DEFER_MS`       | Client defer before loading analytics script                          | `3000`                                                                   |
| `NUXT_PUBLIC_APP_ENV`                  | Controls auth cookie `secure` flag via `runtimeConfig.public.appEnv`  | `development` locally; Docker Compose sets `production` or `development` |
| `NUXT_REVALIDATE_SECRET`               | Server-only secret for `POST /api/revalidate` (`x-revalidate-secret`) | placeholder in tracked `.env.*`; override in real environments           |

Production auth cookies are marked `secure` when `NUXT_PUBLIC_APP_ENV=production`, so real login flows must be served over HTTPS.

`NUXT_REVALIDATE_SECRET` is not exposed to the client (`runtimeConfig.revalidateSecret`). If it is unset, `/api/revalidate` returns 503 so unauthenticated cache purge is not available in production.

## Local Full-Stack Verification

When pairing this frontend with `nuxt-modern-starter-api` in Docker:

1. Start the API stack from the **`nuxt-modern-starter-api` backend repo** (commonly `pnpm docker:dev` there; this frontend uses `pnpm docker:up:dev` for its own Compose stack).
2. Keep frontend `.env.dev` aligned with the API gateway: `NUXT_PUBLIC_API_BASE=http://localhost:2027/api`.
3. Keep backend `.env.development` `CORS_ORIGINS` aligned with the Nuxt dev origin: `http://localhost:3000`.
4. Run `pnpm dev` in this repo and verify sign-in, `/workspace` list/create/delete, `/docs/new` and `/docs/:id` editor load/autosave/title edit, `/workspace/templates` placeholder, and `/account` profile display and logout via the user menu. Route param `:id` is the project id; the page resolves `documentId` before calling editor APIs. Creating a project from the workspace navigates to `/docs/new` first; the API call happens on first non-blank editor save.

## Local Verification

Run the full release gate:

```bash
pnpm quality
```

`pnpm quality` runs lint, format:check, stylelint, typecheck, i18n:check, build, and test. Build runs before test so output-budget tests inspect the latest `.output` assets. Husky pre-commit runs `lint-staged` only; the full gate runs in CI (`.github/workflows/quality.yml`).

## Docker Verification

Build and run the production image directly:

```bash
pnpm docker:build
pnpm docker:run
```

The image runs `.output/server/index.mjs` on port `3000`.

For the full gateway sample, use Compose:

```bash
pnpm docker:up      # production stack, reads .env.prod, sets NUXT_PUBLIC_APP_ENV=production
pnpm docker:up:dev  # development stack with bind mount, reads .env.dev, sets NUXT_PUBLIC_APP_ENV=development
pnpm docker:down
pnpm docker:down:dev
```

Production Compose exposes the Nginx gateway on `GATEWAY_HOST_PORT` or `3000` by default.

## Nginx Reverse Proxy

`docker/nginx/gateway.docker.conf` proxies requests to the Nuxt app upstream named `nuxt:3000`. Browser API calls go directly to `NUXT_PUBLIC_API_BASE`, so configure CORS on the backend or gateway when the API origin differs from the frontend origin. The gateway also applies long-cache headers to `/_nuxt/` assets:

```txt
Cache-Control: public, max-age=31536000, immutable
```

Use this file as a deployment sample, not as a universal production config. The sample already enables basic `gzip` in `gateway.docker.conf`; real deployments should still add TLS, brotli or tuned compression, structured logging, upstream health checks, and platform-specific upstream configuration.
