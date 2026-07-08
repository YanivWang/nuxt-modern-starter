# 脚本命令

## 开发

| 命令            | 说明                     |
| --------------- | ------------------------ |
| `pnpm dev`      | 开发服务器（`.env.dev`） |
| `pnpm dev:test` | 测试环境层               |
| `pnpm dev:prod` | 生产 env 本地预览        |
| `pnpm preview`  | 预览 build 产物          |

## 构建

| 命令              | dotenv      |
| ----------------- | ----------- |
| `pnpm build`      | `.env.prod` |
| `pnpm build:dev`  | `.env.dev`  |
| `pnpm build:test` | `.env.test` |
| `pnpm build:prod` | `.env.prod` |

## 质量

| 命令                | 说明                       |
| ------------------- | -------------------------- |
| `pnpm lint`         | ESLint，`--max-warnings 0` |
| `pnpm format`       | Prettier 写入              |
| `pnpm format:check` | Prettier 检查              |
| `pnpm stylelint`    | SCSS/Vue 样式              |
| `pnpm typecheck`    | Nuxt + vue-tsc             |
| `pnpm test`         | Vitest                     |
| `pnpm test:watch`   | Vitest 监听                |
| `pnpm quality`      | 上述全部 + build           |

## Docker

| 命令                   | 说明         |
| ---------------------- | ------------ |
| `pnpm docker:build`    | 构建镜像     |
| `pnpm docker:run`      | 单容器运行   |
| `pnpm docker:up`       | 生产 Compose |
| `pnpm docker:up:dev`   | 开发 Compose |
| `pnpm docker:down`     | 停止生产栈   |
| `pnpm docker:down:dev` | 停止开发栈   |

## 文档站

| 命令                | 说明               |
| ------------------- | ------------------ |
| `pnpm docs:dev`     | VitePress 开发预览 |
| `pnpm docs:build`   | 构建静态文档       |
| `pnpm docs:preview` | 预览文档 build     |

## 多语言

| 命令               | 说明                                                              |
| ------------------ | ----------------------------------------------------------------- |
| `pnpm i18n:check`  | 校验 locale 配置、目录、resolver、key 完整性与 diff 快照同步      |
| `pnpm i18n:diff`   | 基于聚合后的运行时消息树输出 `scripts/i18n-diff.json`             |
| `pnpm i18n:scan`   | 先从源码重建 diff，再输出实际使用 key 到 `scripts/i18n-used.json` |
| `pnpm i18n:unused` | 先从源码重建 diff，再输出未使用 key 到 `scripts/i18n-unused.json` |

## 引擎版本

```json
"engines": {
  "node": "22.22.3",
  "pnpm": "11.5.2"
}
```

## 下一步

- [配置文件参考](/reference/config)
- [快速开始](/guide/getting-started)
