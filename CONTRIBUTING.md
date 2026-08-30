# 贡献指南

## 环境

```bash
corepack enable
pnpm install
pnpm dev
```

Node 与 pnpm 版本由 `.nvmrc` 与 `package.json#engines` 锁定（`engine-strict=true`，版本不符会直接装不上）。

联调后端时先起 `nuxt-modern-starter-api`，并保持 `.env.dev` 的 `NUXT_PUBLIC_API_BASE` 指向它。

## 提交前

Husky 的 pre-commit 只跑 `lint-staged`（快）。完整门禁在 CI，本地可随时手动跑：

```bash
pnpm quality
```

它串联：lint → format:check → stylelint → typecheck → i18n:check → depcruise → docs:sync:check → build → test。

迭代期间用更快的子集：

```bash
pnpm test:unit        # 纯函数 / 配置 / 静态扫描，秒级
pnpm test:component   # 组件与页面渲染（Nuxt 运行时）
pnpm test:coverage    # 带覆盖率阈值
pnpm test:e2e         # 先 build:e2e，再用 Playwright 跑真实浏览器
```

提交信息走 Conventional Commits，由 commitlint 校验（`feat:` / `fix:` / `docs:` / `refactor:` / `test:` / `chore:`）。

## 这个仓库的几条硬约定

### 1. 改代码就要改头注释

每个源文件顶部有结构化头注释（【文件职责】【架构位置】【依赖关系】【边界与注意】）。
`pnpm docs:sync:check` 会校验它们与 `docs-sync/manifest.json`、`doc-claims.json` 一致。

新增或删除 `app/`、`server/`、`config/`、`docker/` 下的源文件后：

```bash
pnpm docs:sync:manifest   # 重新生成 manifest / batches / COVERAGE
pnpm docs:sync:extract    # 重新生成 doc-references 快照
```

然后给新文件补头注释。

### 2. 架构边界由工具强制，不是靠自觉

| 约束                                                                        | 守护                                                                            |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| 无循环依赖；feature 之间不互相 import；页面只用 feature barrel              | `pnpm depcruise`（真实依赖图）+ `tests/unit/page-structure.test.ts`（源码文本） |
| `config/`、`i18n/` 是叶子层，不反向依赖 `app/`、`server/`                   | `pnpm depcruise`                                                                |
| `server/` 不依赖组件 / 页面 / store                                         | `pnpm depcruise`                                                                |
| 令牌不进 Pinia state（即不进 SSR payload）；登录态 UI 必须包 `<ClientOnly>` | `tests/unit/ssr-cache-safety.test.ts`                                           |
| 构建产物分包与体积预算                                                      | `tests/unit/build-config.test.ts`（读 `.output` 真实文件）                      |

这些不是建议，是会让 CI 变红的断言。要改边界，先改规则并说明理由。

### 3. 测试分层

| 目录              | 环境       | 用途                                                   |
| ----------------- | ---------- | ------------------------------------------------------ |
| `tests/unit`      | happy-dom  | 纯函数、配置、静态扫描。默认环境，秒级反馈             |
| `tests/nuxt`      | nuxt       | 需要 `useRuntimeConfig` / `useCookie` 等运行时的用例   |
| `tests/component` | nuxt       | `mountSuspended` 真实挂载组件与页面                    |
| `tests/e2e`       | Playwright | 真实浏览器跑生产构建；后端由 `tests/e2e/stub-api` 提供 |

需要 Nuxt 运行时的文件，首行写 `// @vitest-environment nuxt`。
**不要**把默认环境改回 `nuxt`：那会让 38 个文件各自构建一个 Nuxt 实例，
既慢，又会因为 CPU 争抢让纯函数用例随机超时。

修 bug 时先写一个能复现的失败用例，再修。

### 4. 面向用户的文案一律走 i18n

15 个语言包在 `i18n/<locale>/modules/`。新增 key 后：

```bash
pnpm i18n:check    # 检查各语言 key 是否齐平
pnpm i18n:unused   # 找出没人用的 key
```

### 5. 颜色只用 design token

产品与公开 UI 代码里禁止硬编码 hex（stylelint `color-no-hex` 强制）。
色值唯一来源是 `config/theme-palette.json`，改完跑 `pnpm generate:theme`。

## 目录该往哪放

| 要加的东西                         | 放哪                                                               |
| ---------------------------------- | ------------------------------------------------------------------ |
| 公开 SEO 页面                      | `app/pages/[[language]]/`                                          |
| 登录后产品页面                     | `app/pages/workspace/`、`app/pages/docs/`、`app/pages/account.vue` |
| 复杂产品 UI 与其 composable / API  | `app/features/<feature>/`，只从 `index.ts` 对外暴露                |
| 跨 feature 的请求适配器            | `app/api/`                                                         |
| 跨 feature 的类型                  | `app/types/`                                                       |
| 站点常量、路由规则、主题、鉴权常量 | `config/`                                                          |
| Nitro 路由、中间件、插件           | `server/`                                                          |

## 安全

漏洞请勿走公开 issue，见 [SECURITY.md](SECURITY.md)。
