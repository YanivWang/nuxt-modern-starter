# Docker

## 文件结构

```
docker/
├── Dockerfile           # 多阶段生产镜像
├── Dockerfile.dev       # 开发基础镜像
├── docker-compose.base.yaml
├── docker-compose.yaml      # 生产：Nginx + Nuxt
├── docker-compose.dev.yaml  # 开发：bind mount + pnpm dev
└── nginx/
    └── gateway.docker.conf
```

## 常用命令

```bash
pnpm docker:build      # 构建本地镜像 nuxt-modern-starter:local
pnpm docker:run        # 单容器运行，读 .env.dev
pnpm docker:up         # 生产 Compose 栈，读 .env.prod
pnpm docker:up:dev     # 开发 Compose 栈，读 .env.dev
pnpm docker:down
pnpm docker:down:dev
```

## 生产镜像

- 基础：`node:22.22.3-alpine`（与 `.nvmrc`、`package.json`、CI 一致）
- 构建：完整源码复制后重新执行 `nuxt prepare`，再运行 `pnpm build:${BUILD_ENV}`
- 启动：`node .output/server/index.mjs`
- 端口：3000
- 健康检查：由 `docker-compose.base.yaml` 的 `healthcheck` 定义（HTTP probe 访问 `http://127.0.0.1:3000/healthz`），非 Dockerfile 内置。
  探活刻意不打首页：打 `/` 会连带跑一遍页面渲染栈，页面本身出错时会被误判成进程已死并触发无谓重启

## Compose 生产栈

`docker-compose.yaml`：

- 服务：`gateway`（Nginx）+ `nuxt`
- 环境：`NUXT_PUBLIC_APP_ENV=production`
- 网关端口：`GATEWAY_HOST_PORT` 或默认 3000

## 开发栈

`docker-compose.dev.yaml`：

- 源码 bind mount
- `pnpm dev` 热更新
- 额外暴露 24678（devtools）
- `NUXT_PUBLIC_APP_ENV=development`

## 注意

- 镜像内 **不复制** 真实 secret env
- 运行时通过 `--env-file` 或 Compose `environment` 注入

## 下一步

- [Nginx 网关](/deployment/nginx)
- [部署概览](/deployment/overview)
