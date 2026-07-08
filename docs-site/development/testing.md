# 测试与质量

## 命令

```bash
pnpm test          # Vitest 一次运行（23 文件 / 84 测试）
pnpm test:watch    # 监听模式
pnpm typecheck     # vue-tsc + Nuxt 类型
pnpm lint            # ESLint
pnpm stylelint       # 样式
pnpm quality         # 发布全量门禁
```

## quality 门禁内容

```
lint → format:check → stylelint → typecheck → test → build
```

Husky pre-commit 跑较快子集：`lint-staged`，再跑 `lint`、`stylelint`、`typecheck`、`test`（不含 `format:check` 和 `build`）。

## 测试分类

| 目录          | 测什么                                            |
| ------------- | ------------------------------------------------- |
| `tests/unit/` | 纯函数、middleware 决策、API 适配器、route helper |
| `tests/nuxt/` | Nuxt 环境 smoke                                   |

## 何时加测试

| 变更            | 建议测试                                            |
| --------------- | --------------------------------------------------- |
| 新 route helper | `locale-routing.test.ts` / `product-routes.test.ts` |
| 新 API 适配器   | `*-api.test.ts`                                     |
| middleware 逻辑 | `auth-middleware.test.ts`                           |
| 安全工具        | `safe-redirect.test.ts`                             |
| HTTP 信封       | `lib-http.test.ts`                                  |
| SWR 缓存失效    | `revalidate.test.ts`                                |

不必为纯 UI 样式写 trivial 测试。

## 发布前

```bash
pnpm quality
pnpm docker:build   # 若涉及部署
```

## 下一步

- [部署概览](/deployment/overview)
- [脚本命令](/reference/scripts)
