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

它串联：lint → format:check → stylelint → typecheck → i18n:check → depcruise → contract:check → docs:sync:check → build → test。

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

### 4. 后端契约是引入的，不是口头约定

`contracts/openapi.yaml` 是后端 `nuxt-modern-starter-api` 的 OpenAPI 副本，随仓库追踪。
它被 prettier 忽略，必须与上游逐字节一致。

```bash
pnpm contract:sync    # 从后端仓库同步（默认 ../nuxt-modern-starter-api）
pnpm contract:check   # 校验副本完整性；有后端仓库时再比对上游
```

同步会把内容摘要与上游 commit 记进 `contracts/SOURCE.json`。
`contract:check` 先核对摘要——这一步不需要后端仓库，所以前端 CI 里也能挡住「有人直接改了引入副本」；
再在后端仓库存在时比对上游是否已经走在前面。**引入副本只由 `contract:sync` 生成，不要手工编辑。**

`tests/unit/api-contract.test.ts` 在这份副本上校验：

**路径层**

- 四个环境层的 `NUXT_PUBLIC_API_BASE` 都指向 spec 里的版本前缀（当前 `/api/v1`）
- 前端消费的每个端点都存在于契约中
- E2E 桩后端与真实后端用同一个前缀，且不实现前端不消费的端点

**字段层**

- 每个消费端点的响应 `data` 在契约里真的描述了形状（不是等价于「任意值」的空 schema）
- 每个消费端点 `data` 的顶层必填字段与登记的清单**精确相等**——加字段和删字段两个方向都会红
- 前端领域类型（`WorkspaceProject`、`EditorDocument`、`PricingPageContent` 等）的每个字段
  都存在于契约中，且 JSON 类型与枚举取值一致

**错误状态码层**

- 每个消费端点声明的非 2xx 状态码与登记的清单**精确相等**
- 需要鉴权的端点必须声明 401，否则 HTTP client 的「401 单飞 refresh 并重试一次」在契约上无依据

前端对这些码有真实分支：401 触发 refresh，404 走空态，409 提示用户名已占用，
410 意味着分片上传任务过期必须重新发起。后端增删一个状态码而前端不知道，
表现就是线上偶发一个没人处理的错误。

字段层靠 `Record<keyof T, FieldSpec>` 把两头焊死：领域类型增删字段而映射表没跟上是**编译错误**，
映射表与 spec 不一致是**测试失败**。所以这里不引入 openapi-typescript 之类的生成器——
生成物本身又是一份要维护同步的产物，而这条链路已经不需要它了。

**桩后端层**

`tests/unit/stub-api-contract.test.ts` 用 0 端口起一个桩实例，对它实现的每个端点发真实请求，
再用 ajv 按契约校验状态码与响应体。E2E 跑的是桩不是真实后端，桩少返回一个后端必填字段，
整轮 E2E 就是在一份现实中不存在的响应上通过。覆盖面由桩自己的路由表反查：
新增桩路由却没登记契约用例会直接失败。

前端明知故犯不消费的后端必填字段（当前是 `status`、`slideCount`）登记在 `ignoredRequired` 里。
这份清单也会被校验：后端新增或删除必填字段时它就不再准确，测试会要求人工复核一次。

新增调用后端的 adapter 时，要在该测试里登记两处：`CONSUMED_ENDPOINTS` 的端点，
和 `RESPONSE_DATA_KEYS` 的 `data` 形状。这是手工清单：adapter 里的路径字面量和前端路由字面量
在文本上无法可靠区分，自动抽取只会带来假阳性。换来的是端点被后端改名、删除或改字段时立刻失败。

后端接口变更的协作顺序：后端改 → 后端 `pnpm openapi:generate` → 前端 `pnpm contract:sync`
→ 前端跑 `pnpm test` 看契约测试是否变红 → 按需调整 adapter、类型与桩后端。

### 5. 事后跳转不要裸调 router.push

`switchLanguage`、`handleLogout`、登录/注册成功后的跳转，都是 click handler 里 fire-and-forget
调用的 async 函数——它们的返回值没人接。`router.push` 一旦 reject，应用里就没有任何 catch，
只会变成一条 unhandled rejection：浏览器里被全局 error reporter 记一笔，
测试里则表现为随机归属到某个正在跑的用例上的 unhandled error。

而这条 rejection 本身是重复的：路由 middleware 抛错时 Nuxt 已经在 `beforeEach` 里
用 `showError` 渲染了错误页，随后又把 Error 返回给 vue-router，于是 `push()` 再 reject 一次。

所以这类「动作已经完成，跳转只是把 URL 对齐」的场景一律走 `app/utils/navigate-safely.ts`：

```ts
import { pushSafely, replaceSafely } from '~/utils/navigate-safely'

await pushSafely(router, localePath('/'))
```

两个例外**不**适用：

- 路由 middleware 里的 `navigateTo` 是 return 给 Nuxt 的导航指令，由 Nuxt 接管
- 调用方真的要对失败做点什么时（如 `WorkspaceDashboard` 跳转失败要复位 loading 态），
  写自己的 `try/catch` 才对，那不是「吞掉」

### 6. 面向用户的文案一律走 i18n

15 个语言包在 `i18n/<locale>/modules/`。新增 key 后：

```bash
pnpm i18n:check    # 检查各语言 key 是否齐平
pnpm i18n:unused   # 找出没人用的 key
```

### 7. 颜色只用 design token

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
