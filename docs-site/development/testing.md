# 测试与质量

## 命令

```bash
pnpm test            # Vitest 全量（单元 + 组件）
pnpm test:unit       # 仅 tests/unit，happy-dom，秒级反馈
pnpm test:component  # 仅 tests/component + tests/nuxt，需要 Nuxt 运行时
pnpm test:coverage   # 带覆盖率阈值
pnpm test:e2e        # 经 scripts/run-e2e.mjs：先 build:e2e，再用 Playwright 跑真实浏览器
pnpm test:e2e:only   # 复用已有 .output，跳过重新构建
pnpm typecheck       # vue-tsc + Nuxt 类型
pnpm lint            # ESLint
pnpm stylelint       # 样式
pnpm depcruise       # 依赖图边界
pnpm contract:check  # 引入的后端契约是否落后于上游
pnpm contract:sync   # 从后端仓库同步 contracts/openapi.yaml
pnpm quality         # 发布全量门禁
```

## 测试分层

| 目录               | 环境       | 测什么                                                                   |
| ------------------ | ---------- | ------------------------------------------------------------------------ |
| `tests/unit/`      | happy-dom  | 纯函数、middleware 决策、API 适配器、配置常量、源码静态扫描              |
| `tests/nuxt/`      | nuxt       | 需要 `useRuntimeConfig` / `useCookie` / `useNuxtApp` 的运行时行为        |
| `tests/component/` | nuxt       | 用 @nuxt/test-utils 的 mountSuspended 真实挂载组件与页面，断言渲染与交互 |
| `tests/e2e/`       | Playwright | 真实浏览器跑生产构建，覆盖 301 / SEO / 鉴权闭环 / 编辑器主流程           |

### 环境是按文件 opt-in 的

`vitest.config.ts` 的默认环境是 **happy-dom**。需要 Nuxt 运行时的文件在首行写：

```ts
// @vitest-environment nuxt
```

不要把默认环境改回 `nuxt`。每个 nuxt 环境文件都会在自己的 worker 里构建一整个 Nuxt 实例：
全量套件里十几个实例同时抢 CPU，会把本来 1 秒的纯函数用例饿到超时，表现为
「单独跑全绿、跑全量随机挂几个」。同样的原因，`maxWorkers` 被显式压到 6。

`hookTimeout` 也必须显式放宽：`@nuxt/test-utils` 的 `setupNuxt()` 跑在 `beforeAll` 里，
冷启动远超 Vitest 默认的 10 秒，用默认值会让整个文件以 `Hook timed out` 失败，
并把其中所有用例标记为 skipped —— 门禁看起来在跑，其实什么都没测。

### E2E 的后端是一个桩

`tests/e2e/stub-api/server.mjs` 是零依赖的 Node http 服务，实现了
`nuxt-modern-starter-api` 的请求契约。用桩而不是浏览器侧 route 拦截，是因为
`/news`、`/pricing` 是 SSR / SWR 页面，请求由 Nitro 在**服务端**发出，浏览器拦截够不到。

它同时是「前端假设的后端契约」的可执行文档：契约漂移会让 E2E 直接失败。

### E2E 不覆盖第三方编辑器内部

编辑器由第三方包 @yanivjs/yaniv-editor 提供。图片与大文件上传的入口是以 props 形式
传进这个组件的（见 `useEditorMediaUpload`），要在浏览器里触发它，就得驱动该包自己的 DOM。

**刻意不做这类测试**：它会把测试套件耦合到一个依赖的实现细节上，包一升级就碎，
而碎了并不说明我们的产品有问题 —— 这种测试的维护成本全是噪声，没有信号。

上传并非因此失去保护，只是保护不在浏览器层：

| 层次             | 覆盖方式                                                    |
| ---------------- | ----------------------------------------------------------- |
| 端点与响应字段   | `tests/unit/api-contract.test.ts`（对着引入的契约副本断言） |
| adapter 请求行为 | `tests/unit/editor-upload-api.test.ts`（mock client）       |
| 真实响应形状     | nuxt-modern-starter-api 的 response-contract 集成测试       |
| 真实错误状态码   | nuxt-modern-starter-api 的 error-contract 集成测试          |

如果哪天真的需要浏览器级覆盖，正确做法是加一条只在测试构建里存在的 harness 路由直接调
上传 composable，而不是去点第三方编辑器的按钮。

## 覆盖率

`pnpm test:coverage` 采集 v8 覆盖率，阈值写在 `vitest.config.ts`：

- 全局阈值偏低是预期内的 —— `.vue` 的渲染路径主要由 `tests/component` 与 `tests/e2e` 覆盖，
  而 E2E 不计入 v8 覆盖率。
- 纯逻辑层（`app/lib/http`、`app/utils`、`config`、`server/utils`）单独设了高得多的阈值，
  防止真正该测的代码退化。

阈值是**棘轮**：只允许调高，不允许为了让 CI 变绿而调低。

## 架构边界由工具强制

| 约束                                                | 守护                                                                         |
| --------------------------------------------------- | ---------------------------------------------------------------------------- |
| 无循环依赖                                          | `pnpm depcruise`                                                             |
| feature 之间不互相 import；页面只用 feature barrel  | `pnpm depcruise` + `tests/unit/page-structure.test.ts`                       |
| `config/`、`i18n/` 是叶子层                         | `pnpm depcruise`                                                             |
| `server/` 不依赖组件 / 页面 / store                 | `pnpm depcruise`                                                             |
| 令牌不进 SSR payload；登录态 UI 必须包 `ClientOnly` | `tests/unit/ssr-cache-safety.test.ts` + `tests/component/app-header.test.ts` |
| 构建产物分包与体积预算                              | `tests/unit/build-config.test.ts`（读 `.output` 真实文件）                   |
| SWR 缓存 key 算法与 Nitro 一致                      | `tests/unit/revalidate-nitro-contract.test.ts`                               |
| 后端响应字段形状与前端领域类型一致                  | `tests/unit/api-contract.test.ts`                                            |
| E2E 桩后端的成功响应与后端契约逐字段等价            | `tests/unit/stub-api-contract.test.ts`（ajv 校验真实响应）                   |

`depcruise` 与 `page-structure.test.ts` 是有意重叠的：前者解析真实依赖图，能抓到 re-export 链
与传递依赖；后者扫源码文本，能抓到还没形成依赖边的写法。

## quality 门禁内容

```
lint → format:check → stylelint → typecheck → i18n:check → depcruise → contract:check → docs:sync:check → build → test
```

CI（`.github/workflows/quality.yml`）把它拆成并行 job：`static` / `typecheck` / `test` /
`build` / `e2e` / `audit`。一次 lint 失败不该等 build 跑完才暴露。

Husky pre-commit 只跑 `lint-staged`。全量门禁属于 CI —— 在提交钩子里再跑一遍，
每次提交要等数十秒，却拦不住 CI 拦不住的东西。

## 何时加测试

| 变更               | 建议测试                                                              |
| ------------------ | --------------------------------------------------------------------- |
| 新 route helper    | `locale-routing.test.ts` / `product-routes.test.ts`                   |
| 新 API 适配器      | `*-api.test.ts`                                                       |
| middleware 逻辑    | `auth-middleware.test.ts`                                             |
| 安全工具           | `safe-redirect.test.ts`                                               |
| HTTP 信封          | `lib-http.test.ts`                                                    |
| SWR 缓存失效       | `revalidate.test.ts`                                                  |
| 鉴权 / 缓存边界    | `ssr-cache-safety.test.ts`                                            |
| 组件渲染分支       | `tests/component/*.test.ts`                                           |
| 跨页面的用户流程   | `tests/e2e/specs/*.spec.ts`                                           |
| 日志 / 限流 / 上报 | `observability.test.ts`、`rate-limit.test.ts`、`error-report.test.ts` |

修 bug 时先写一个能复现的失败用例，再修。不必为纯 UI 样式写 trivial 测试。

## 发布前

```bash
pnpm quality
pnpm test:e2e
pnpm docker:build   # 若涉及部署
```

### 端口被占用时

E2E 默认用 3399（应用）与 2127（桩后端）。本机若已有别的服务占着，覆盖这两个变量即可：

```bash
E2E_APP_PORT=3411 STUB_API_PORT=2131 pnpm test:e2e
```

不需要改 `.env.e2e`。`scripts/run-e2e.mjs` 会把对应的 `NUXT_PUBLIC_SITE_URL` /
`NUXT_PUBLIC_API_BASE` 同时传给**构建**和 Playwright —— 两个阶段必须拿到同一份端口：
预渲染页在构建时就把 siteUrl 烤进了 canonical / hreflang / JSON-LD，只改运行端口的话，
首页断言会拿到上一次构建留下的地址。

## 下一步

- [部署概览](/deployment/overview)
- [脚本命令](/reference/scripts)
