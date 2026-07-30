# Final Report — 文档与注释严格对齐（100% 全量）

Generated: 2026-07-09（全量引用校验落地）

## 执行摘要

| 指标                     | 结果                                      |
| ------------------------ | ----------------------------------------- |
| 源码文件                 | 121 / 121                                 |
| 文档文件                 | 33 / 33                                   |
| 【文件职责】头注释       | 121 / 121                                 |
| 内联注释（非头注释区）   | 121 / 121                                 |
| **全量 doc 引用抽取**    | **1105 条**（1065 可验证 + 40 模板/外部） |
| doc-claims（结构化断言） | 88 条                                     |
| evidenceHint 行号        | 88 / 88                                   |
| **严格 100% 对齐**       | `verify-full-alignment.mjs` exit 0        |
| `pnpm docs:sync:check`   | exit 0（含严格校验）                      |
| `pnpm test` doc-claims   | 6/6 通过                                  |

## 与「抽样 claim」的区别

此前 88 条 claim 仅为**每文档 ≥2 条代表性断言**，覆盖率约 20–25%。

现已升级为 **全量引用校验**：

1. `extract-doc-references.mjs` — 从 33 篇文档抽取全部可验证引用（路径、符号、路由、env、脚本、版本、CSS token 等）
2. `verify-full-alignment.mjs` — 逐条对照源码索引，**不允许未解析引用**
3. 集成进 `pnpm docs:sync:check` — 改代码/文档后必须全绿

## 校验范围（1065 条可验证引用）

| 类型                           | 校验规则                                               |
| ------------------------------ | ------------------------------------------------------ |
| file-path                      | 磁盘/manifest 存在                                     |
| symbol                         | 121 源文件符号索引命中                                 |
| route                          | pages + config/routes + 多语言变体 + 产品区 301 源路径 |
| script                         | package.json scripts                                   |
| env-var                        | nuxt.config.ts runtimeConfig 映射                      |
| version                        | package.json engines/deps 精确匹配                     |
| css-var / css-class / scss-var | styles 目录实存                                        |
| test-count                     | vitest 实测 35 文件 / 134 用例                         |
| header-export                  | 每个 export 须在【主要导出】或内联注释中               |

**跳过（模板/外部，非漂移）**：`path-pattern`（`<feature>`、`**`）、`route-template`（`` `/news/${slug}` ``）、`external-script`（`pnpm install`、后端仓 `docker:dev`）

## 命令

```bash
pnpm docs:sync:extract   # 重生 doc-references.json
pnpm docs:sync:enrich    # 更新 claim evidenceHint
pnpm docs:sync:check     # 头注释 + claims + 严格 100% 全量校验
```

## 本轮修正

| 项             | 修正                                                                                             |
| -------------- | ------------------------------------------------------------------------------------------------ |
| `guide-ov-001` | 测试规模 31/111 → **35/134**（与 vitest 实测一致）                                               |
| 严格校验器     | 新增 `docs-sync/lib/source-index.mjs`、`extract-doc-references.mjs`、`verify-full-alignment.mjs` |
| 门禁集成       | `check-docs-sync.mjs` 步骤 9 强制跑全量校验                                                      |
| 单测           | `doc-claims.test.ts` 新增 strict alignment 用例                                                  |

---

**状态：按「不允许抽样、必须 100% 对齐」标准落地。** 后续改文档或代码后运行 `pnpm docs:sync:check` 即可保持全量一致。
