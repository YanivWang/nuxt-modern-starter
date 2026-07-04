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

`pnpm test` 结果：8 个测试文件通过，覆盖 locale、SEO route、auth store/middleware/permission、API 契约和 Nuxt smoke 测试。

`pnpm build` 结果：Nuxt production build 通过，Nitro preset 为 `node-server`，并完成 `/`、`/pricing`、`/help`、`/en`、`/en/pricing`、`/en/help` 的 prerender。

## Docker/Nginx 验证状态

以下 Docker/Nginx 验证已通过：

```bash
pnpm docker:build
docker run -d --name nuxt-modern-starter-verify -p 3100:3000 --env-file .env.dev nuxt-modern-starter:local
```

Docker 镜像构建成功，构建日志确认 Nitro preset 为 `node-server`，并提示可通过 `node .output/server/index.mjs` 预览。容器启动后，`http://localhost:3100/api/health` 返回 `200`：

```json
{ "code": 0, "message": "ok", "data": { "status": "ok", "timestamp": "2026-07-04T07:15:07.065Z" } }
```

Nginx 反代验证使用 `docker/nginx/gateway.docker.conf`、专用 Docker network 和 `nginx:alpine` 完成：

```bash
docker run -d --name nuxt-modern-starter-nginx-verify --network nuxt-modern-starter-verify-net -p 3200:80 -v "$PWD/docker/nginx/gateway.docker.conf:/etc/nginx/conf.d/default.conf:ro" nginx:alpine
```

验证结果：

- `http://localhost:3200/` 返回 `200`。
- 代理后的 `/_nuxt/DgEloujL.js` 返回 `200`。
- `/_nuxt/` 静态资源响应包含 `Cache-Control: public, max-age=31536000, immutable`。
