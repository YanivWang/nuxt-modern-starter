# Verification Record

记录日期：2026-07-04

## 本地质量门禁

以下命令已通过：

```bash
pnpm lint
pnpm format:check
pnpm stylelint
pnpm typecheck
pnpm test
pnpm build
printf 'feat: verify v0.1 core\n' | pnpm exec commitlint
```

`pnpm test` 结果：8 个测试文件、25 条用例通过，覆盖 locale 路由决策、SEO route、auth store/middleware/permission、API 契约和 Nuxt smoke 测试。

`pnpm build` 结果：Nuxt production build 通过，并完成 `/`、`/pricing`、`/help`、`/en`、`/en/pricing`、`/en/help` 的 prerender。

## Docker/Nginx 验证状态

以下 Docker/Nginx 验证已通过：

```bash
pnpm docker:build
docker run -d --name nuxt-modern-starter-verify -p 3100:3000 --env-file .env.dev nuxt-modern-starter:local
```

Docker 镜像构建成功，并提示可通过 `node .output/server/index.mjs` 预览。容器启动后，首页返回 `200`。

Nginx 反代验证使用 `docker/nginx/gateway.docker.conf`、专用 Docker network 和 `nginx:alpine` 完成：

```bash
docker run -d --name nuxt-modern-starter-nginx-verify --network nuxt-modern-starter-verify-net -p 3200:80 -v "$PWD/docker/nginx/gateway.docker.conf:/etc/nginx/conf.d/default.conf:ro" nginx:alpine
```

验证结果：

- `http://localhost:3200/` 返回 `200`。
- 代理后的 `/_nuxt/DgEloujL.js` 返回 `200`。
- `/_nuxt/` 静态资源响应包含 `Cache-Control: public, max-age=31536000, immutable`。

## 2026-07-05 企业化请求架构改造验证

以下命令已通过：

```bash
corepack pnpm test tests/unit/api-core.test.ts tests/unit/use-api.test.ts tests/unit/public-content-api.test.ts tests/unit/editor-api.test.ts tests/unit/auth-store.test.ts
corepack pnpm format:check
corepack pnpm lint
corepack pnpm stylelint
corepack pnpm test
corepack pnpm typecheck
corepack pnpm build
```

验证结果：

- focused tests：5 个测试文件、20 条用例通过，覆盖 `api-core`、public/editor 场景入口、public content adapter、editor adapter 和 auth store。
- format/lint/stylelint：全部通过。
- full tests：12 个测试文件、37 条用例通过。
- typecheck：Nuxt typecheck 通过。
- build：Nuxt production build 通过，Nitro preset 仍为 `node-server`，并完成 `/`、`/pricing`、`/help`、`/en`、`/en/pricing`、`/en/help` 的 prerender。

构建期间仍有 Vite/Nuxt sourcemap 与 chunk size 警告，但未阻断构建。当前最大 chunk 主要来自编辑器/Ant Design Vue 相关依赖，后续可在编辑器功能稳定后再评估动态导入和 manual chunks。
