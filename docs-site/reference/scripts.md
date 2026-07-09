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

| 命令                | 说明                                                                    |
| ------------------- | ----------------------------------------------------------------------- |
| `pnpm lint`         | ESLint，`--max-warnings 0`                                              |
| `pnpm format`       | Prettier 写入                                                           |
| `pnpm format:check` | Prettier 检查                                                           |
| `pnpm stylelint`    | SCSS/Vue 样式                                                           |
| `pnpm typecheck`    | Nuxt + vue-tsc                                                          |
| `pnpm test`         | Vitest                                                                  |
| `pnpm test:watch`   | Vitest 监听                                                             |
| `pnpm quality`      | lint + format:check + stylelint + typecheck + i18n:check + test + build |

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

| 命令                     | 说明                                                       |
| ------------------------ | ---------------------------------------------------------- |
| `pnpm docs:dev`          | VitePress 开发预览                                         |
| `pnpm docs:build`        | 构建静态文档                                               |
| `pnpm docs:preview`      | 预览文档 build                                             |
| `pnpm docs:sync:check`   | 校验 manifest / 头注释 / doc-claims 与源码一致             |
| `pnpm docs:sync:enrich`  | 为 doc-claims 生成 evidenceHint 行号并验证 33 文档覆盖     |
| `pnpm docs:sync:reports` | 从 batches + doc-claims 生成 8 份带行号证据的 batch report |

## 多语言

| 命令                  | 说明                                                                         |
| --------------------- | ---------------------------------------------------------------------------- |
| `pnpm i18n:check`     | 校验 locale 配置、目录、resolver、AntD 映射、key 完整性与快照同步            |
| `pnpm i18n:diff`      | 基于聚合后的运行时消息树输出 `scripts/i18n-diff.json`                        |
| `pnpm i18n:scan`      | 先从源码重建 diff，再输出实际使用 key 到 `scripts/i18n-used.json`            |
| `pnpm generate:theme` | 从 `config/theme-palette.json` 生成 `tokens/_variables.scss` 与 `_dark.scss` |

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
