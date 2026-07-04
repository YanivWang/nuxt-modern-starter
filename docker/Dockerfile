# 文件职责：生产镜像构建。
# 多阶段安装依赖、编译 Nuxt，并在运行阶段只保留 .output 与非 root 用户。
ARG PNPM_VERSION=11.5.2
ARG NODE_IMAGE=node:22-alpine

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
RUN pnpm run build:${BUILD_ENV}

FROM ${NODE_IMAGE} AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

COPY --from=build --chown=node:node /app/.output ./.output

USER node
EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
