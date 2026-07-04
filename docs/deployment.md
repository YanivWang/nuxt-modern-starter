# Deployment

## Default Target

v0.1-core defaults to Nitro `node-server`. Build output is started with:

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

Committed env files should only contain non-secret defaults. Override them with deployment-provided `NUXT_*` variables for real environments.

## Local Verification

```bash
pnpm install
pnpm dev
pnpm lint
pnpm format:check
pnpm stylelint
pnpm typecheck
pnpm test
pnpm build
```

## Docker Verification

```bash
pnpm docker:build
pnpm docker:run
```

The image runs `.output/server/index.mjs` on port `3000`.

## Nginx Reverse Proxy

`docker/nginx/gateway.docker.conf` proxies requests to the Nuxt node-server upstream named `nuxt:3000`. It also applies long-cache headers to `/_nuxt/` assets:

```txt
Cache-Control: public, max-age=31536000, immutable
```

Use this file as a deployment sample, not as a universal production config. Real deployments should add TLS, compression, logging, health checks, and platform-specific upstream configuration.

## Other Platforms

Vercel, Cloudflare, and fully static/prerender deployments are documented boundaries only in v0.1-core. Validate them in a separate deployment task before using them as a supported default.

Remote CI is out of scope for v0.1-core.
