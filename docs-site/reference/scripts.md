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
| `pnpm quality`      | lint + format:check + stylelint + typecheck + i18n:check + build + test |

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

| 命令                      | 说明                                                       |
| ------------------------- | ---------------------------------------------------------- |
| `pnpm docs:dev`           | VitePress 开发预览                                         |
| `pnpm docs:build`         | 构建静态文档（CI 会注入 `VITEPRESS_BASE=/<repo>/`）        |
| `pnpm docs:preview`       | 预览文档 build                                             |
| `pnpm docs:sync:check`    | 校验 manifest / 头注释 / doc-claims 与源码一致             |
| `pnpm docs:sync:enrich`   | 为 doc-claims 生成 evidenceHint 行号并验证 33 文档覆盖     |
| `pnpm docs:sync:reports`  | 从 batches + doc-claims 生成 8 份带行号证据的 batch report |
| `pnpm docs:sync:manifest` | 新增/删除源文件后重新生成 manifest、batches 与 COVERAGE    |
| `pnpm docs:sync:extract`  | 改动文档后重新生成 doc-references 快照                     |

`docs-sync/` 的构成：

| 文件                             | 作用                                                         |
| -------------------------------- | ------------------------------------------------------------ |
| `manifest.json` / `batches.json` | 覆盖范围快照，由 `docs:sync:manifest` 生成                   |
| `doc-claims.json`                | 文档主张 → 源码符号与行号证据                                |
| `doc-references.json`            | 文档引用快照，由 `docs:sync:extract` 生成，过期会被门禁拦下  |
| `legacy-terms.json`              | 对外表述黑名单数据（模式本身是被禁字面量，故不写进测试代码） |
| `lib/enumerate-sources.mjs`      | 覆盖范围的单一枚举来源，生成器与校验器共用                   |

覆盖范围不锁硬编码计数：门禁对着真实文件树 diff，新增文件时报出的是文件名与
`pnpm docs:sync:manifest` 提示。

## 多语言

| 命令                  | 说明                                                                         |
| --------------------- | ---------------------------------------------------------------------------- |
| `pnpm i18n:check`     | 校验 locale 配置、目录、resolver、AntD 映射、key 完整性与快照同步            |
| `pnpm i18n:diff`      | 基于聚合后的运行时消息树输出 `scripts/i18n-diff.json`                        |
| `pnpm i18n:scan`      | 先从源码重建 diff，再输出实际使用 key 到 `scripts/i18n-used.json`            |
| `pnpm i18n:unused`    | 输出语言包中未被源码引用的 key 到 `scripts/i18n-unused.json`                 |
| `pnpm generate:theme` | 从 `config/theme-palette.json` 生成 `tokens/_variables.scss` 与 `_dark.scss` |

## 引擎版本

```json
"engines": {
  "node": ">=22.22.3 <23",
  "pnpm": ">=11.25.0 <12"
}
```

## 下一步

- [配置文件参考](/reference/config)
- [快速开始](/guide/getting-started)
