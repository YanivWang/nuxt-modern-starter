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

- 基础：`node:22-alpine`
- 构建：`pnpm build:${BUILD_ENV}`
- 启动：`node .output/server/index.mjs`
- 端口：3000
- 健康检查：内置 HTTP probe

## Compose 生产栈

`docker-compose.yaml`：

- 服务：`gateway`（Nginx）+ `nuxt`
- 环境：`NUXT_APP_ENV=production`
- 网关端口：`GATEWAY_HOST_PORT` 或默认 3000

## 开发栈

`docker-compose.dev.yaml`：

- 源码 bind mount
- `pnpm dev` 热更新
- 额外暴露 24678（devtools）
- `NUXT_APP_ENV=dev`

## 注意

- 镜像内 **不复制** 真实 secret env
- 运行时通过 `--env-file` 或 Compose `environment` 注入

## 下一步

- [Nginx 网关](/deployment/nginx)
- [部署概览](/deployment/overview)
