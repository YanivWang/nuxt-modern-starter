# 【文件职责】
#   生产 Docker 镜像：多阶段 pnpm install + Nuxt build，runtime 仅 .output 与非 root node 用户。
#
# 【架构位置】
#   docker/ — 与 docker-compose.base.yaml build 目标配合。
#
# 【主要导出 / 路由】
#   镜像 CMD node .output/server/index.mjs，PORT 3000
#
# 【依赖关系】
#   - 依赖：package.json、pnpm-lock、BUILD_ENV build arg
#   - 被引用：docker-compose.base.yaml、pnpm docker:build
#
# 【渲染 / 数据】
#   NODE_ENV=production；不在镜像内复制真实 .env，运行时 env_file 注入。
#
# 【边界与注意】
#   HUSKY=0 禁用 git hooks；BUILD_ENV 默认 prod 对应 pnpm run build:prod。
# 文件职责：生产镜像构建。
# 多阶段安装依赖、编译 Nuxt，并在运行阶段只保留 .output 与非 root 用户。
ARG PNPM_VERSION=11.5.2
ARG NODE_IMAGE=node:22.22.3-alpine

FROM ${NODE_IMAGE} AS base
WORKDIR /app
ENV HUSKY=0
ARG PNPM_VERSION
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

FROM base AS deps
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM deps AS build
ARG BUILD_ENV=prod
COPY . .
# deps 层的 postinstall 发生在源码复制前；这里必须基于完整项目重新生成 Nuxt 类型与自动导入。
RUN pnpm exec nuxt prepare && pnpm run build:${BUILD_ENV}

FROM ${NODE_IMAGE} AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

COPY --from=build --chown=node:node /app/.output ./.output

USER node
EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
