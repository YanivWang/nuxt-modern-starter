# 修复计划 · nuxt-modern-starter

> **生成时间**:2026-07-30
> **基线**:`main` @ `ece56c2`(61 commits,2026-07-04 → 07-22)
> **约束**:🔴 **彻底修复,不留兼容层;每批完成后 `pnpm quality` 必须全绿**

---

## 0. 前提:项目当前是全绿的

修复前实跑确认,**没有任何一项门禁是红的**:

| 检查                       | 结果                                                   |
| -------------------------- | ------------------------------------------------------ |
| `docs:sync:check`          | ✅ scope 121 files / claims 88 / strict alignment 100% |
| `lint`(`--max-warnings 0`) | ✅                                                     |
| `format:check`             | ✅                                                     |
| `stylelint`                | ✅                                                     |
| `i18n:check`               | ✅ 15 locales / 140 keys                               |
| `typecheck`                | ✅                                                     |
| `test`                     | ✅ **35 文件 / 126 用例**(12.9s)                       |

**所以本计划里没有一条是"修坏掉的东西"** —— 全部是**门禁盖不到**的缺陷。
这也意味着:每一条修复都必须**自带能拦住它的检查**,否则修完还是会退化。

---

## 1. 范围

### 纳入修复(9 项)

| #   | 问题                                          | 档    | 成本   |
| --- | --------------------------------------------- | ----- | ------ |
| 1   | 架构守护测试有缺口,已放过 1 处真实违规        | 🔴 P1 | 0.5 天 |
| 2   | revalidate 缓存清除会**静默失效**             | 🔴 P1 | 0.5 天 |
| 3   | revalidate 鉴权三处(时序 / 限流 / 路径白名单) | 🟡 P2 | 0.5 天 |
| 4   | `safe-redirect` 对控制字符失效                | 🟡 P2 | 0.5 h  |
| 5   | `safe-redirect` 对冒号过严 → 误拒合法路径     | 🟡 P2 | 0.5 h  |
| 6   | `build-config.test.ts` 锁在源码文本层         | 🟡 P2 | 0.5 天 |
| 7   | `editor → workspace` 运行时耦合 6 处          | 🟡 P2 | 1–2 天 |
| 9   | `.env.prod` 被 gitignore 白名单强制提交       | 🟡 P3 | 10 min |
| 10  | commit type 误用                              | 🟢 P4 | 约定   |

### 🔴 单独决策(1 项)

| #   | 问题                                    | 为什么不能直接修                              |
| --- | --------------------------------------- | --------------------------------------------- |
| 8   | CSP `script-src` 开了 `'unsafe-inline'` | **与 prerender/SWR 缓存策略存在硬冲突**,见 §4 |

### 不纳入(1 项)

| #   | 问题                | 理由                                                                                                                                                                        |
| --- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 11  | 无 E2E,测试比例 26% | 这是**覆盖缺口不是缺陷**。上不上 Playwright 是产品节奏决策,不属于"修复"。`.gitignore` 已预留 `.playwright` / `playwright-report` / `test-results`,基础设施就位,单独立项即可 |

---

## 2. 逐项修复方案

### 🔴 #1 架构守护测试缺口 + 一处真实违规

**证据**

`app/features/workspace/index.ts` 文件头:

> 页面须从 `~/features/workspace` 导入,**勿深引 components 或 api 路径**

`tests/unit/page-structure.test.ts:44`:

```js
expect(source).not.toMatch(/from ['"](?:\.\.\/)+(?:features|api)\//)
```

只拦**相对路径**,不拦别名深引。全库扫描漏了正好一处:

```
app/pages/docs/[id].vue → ~/features/editor/composables/useEditorPage
```

且检查范围是**硬编码的 4 个文件**,新增页面自动脱检。

**彻底修复(不留兼容层)**

1. `useEditorPage` 提升到 `app/features/editor/index.ts` 的导出面
2. `app/pages/docs/[id].vue` 改为 `import { useEditorPage } from '~/features/editor'`
   —— **不在旧路径留 re-export**
3. 重写测试为**全量遍历 + 双形式拦截**:
   - 遍历 `app/pages/**/*.vue`,不再硬编码文件名
   - 同时拦相对路径 `../features/…` 与别名深引 `~/features/<name>/<内部路径>`
   - 允许的唯一形式:`~/features/<name>`(barrel)

**验证**

- 先只改测试 → `page-structure` **必须失败**(证明它现在真的能拦)
- 再改代码 → 全绿
- 新增一个反例文件临时验证遍历生效,验完删除

**风险**:低。`useEditorPage` 是否适合进 barrel 需看它的依赖面,若它反向依赖 `pages` 层则需先解耦。

---

### 🔴 #2 revalidate 缓存清除静默失效

**证据**

`server/utils/revalidate.ts:32-45` 自行复刻 Nitro 的 cache key 算法,文件头自己承认:

> key 算法需与 Nitro `cachedEventHandler` 保持一致

而 `tests/unit/revalidate.test.ts:21` 只断言前缀与幂等:

```js
expect(first).toMatch(/^nitro\/routes:_:/)
expect(first).toBe(second)
```

**没有任何测试验证这个 key 真的命中 Nitro 写入的条目。**

失败模式:key 一漂移 → `storage.hasItem()` 返回 false → `purged: []` → 端点**仍返回 HTTP 200**。
webhook 调用方以为成功,页面继续吃最长 3600s 的陈旧缓存。**升级 Nitro 就可能踩到,零信号。**

**彻底修复(不留兼容层)**

1. **失败必须响亮** —— `purgeRouteCaches` 返回 `{purged, missed}`;端点在 `missed.length > 0` 时返回
   **HTTP 207 + 明细**,全部 miss 时返回 **500**。**不保留"静默 200"这个行为**
2. **加集成测试锁住真实契约**(替换掉现有的前缀断言,不是并存):
   - 用 `@nuxt/test-utils` 起真实 server
   - 请求一个 SWR 路由 → 断言 `useStorage('cache')` 里出现了条目
   - 调 `buildRouteCacheKey()` → 断言算出的 key **等于**实际存在的那个 key
   - 调 purge → 断言条目消失
3. 现有 `revalidate.test.ts` 的前缀/幂等断言**删除**,由上面的集成测试取代

**验证**:故意把 `.slice(0, 16)` 改成 `.slice(0, 15)` → 集成测试必须失败。改回 → 绿。

**风险**:中。`useStorage('cache')` 在测试环境的可达性需先验证;若 `@nuxt/test-utils` 拿不到 Nitro storage,退化方案是起真实 `nuxt build && nuxt preview` 后走 HTTP 断言(慢但有效)。

---

### 🟡 #3 revalidate 端点鉴权(同一文件三处)

**证据** `server/api/revalidate.post.ts:27`

```js
if (!providedSecret || providedSecret !== revalidateSecret) {
```

**彻底修复**

| 子项               | 改法                                                                                                                                                                                                           |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **非恒定时间比较** | 改 `crypto.timingSafeEqual`。两侧先做 `sha256` 摘要再比,天然对齐长度,避免 `timingSafeEqual` 长度不等抛错                                                                                                       |
| **无限流**         | Nitro 中间件按 IP 做计数窗口(如 10 次 / 分钟),超限返回 429。**不引入新依赖**,用内存 Map + 定时清理即可(单实例足够;多实例场景在文件头注明限制)                                                                  |
| **paths 无白名单** | 新增 `isRevalidatablePath(path)`,校验命中 `config/routes.ts` 的 `swrRouteRules`(实测为 `['/news/**', ...nonDefaultLocalePrefixes.map(p => '/'+p+'/news/**')]`)。不命中的 path **直接 400 拒绝**,不做"尽力清除" |

**验证**:三条各配单测 —— 错误 secret 的响应时间分布、第 11 次请求返回 429、`/workspace` 这类非 SWR 路径返回 400。

**风险**:低。限流的内存态在多实例下不共享,这是**已知限制需写进文件头**,不是缺陷(该端点是内部 webhook)。

---

### 🟡 #4 `safe-redirect` 对控制字符失效

**证据** 实测 `app/utils/safe-redirect.ts:22` 的 `UNSAFE_REDIRECT_PATTERN`:

| 输入                                                           | 当前判定        |
| -------------------------------------------------------------- | --------------- |
| `//evil.com` / `/\evil.com` / `https://evil.com`               | ❌ 拒绝 ✓       |
| **`/\t//evil.com`** / **`/\n//evil.com`** / **`/ //evil.com`** | ✅ **判为安全** |

浏览器按 WHATWG URL 规范**剥离 tab/CR/LF**,`/<TAB>//evil.com` → `///evil.com` → 协议相对 URL → 跳出站外。

**⚠️ 当前利用不了**:唯一 sink 是 `app/pages/[[language]]/sign-in.vue:78` 的 `router.push()`,
Vue Router 按站内路径处理,不会离开 origin。

**仍必须修的理由**:这是一个**导出的、文件头标为「共享层」的安全原语**,
它的职责就是与 sink 无关地成立。哪天 sink 换成 `window.location.href` 或 SSR `sendRedirect`,
漏洞立刻上线,而且没人会回头审这个 util。

**彻底修复**:改为**白名单式**校验(不是继续往黑名单加字符):

- 必须 `/` 开头且第二字符不是 `/` 或 `\`
- 整串不含控制字符 `[�-]` 与空白
- path 首段不含 `:`(见 #5)

**验证**:补 6 条用例 —— `\t` `\n` `\r` 空格 `%2F%2F` 以及正常路径。

---

### 🟡 #5 `safe-redirect` 对冒号过严

**证据**:`[:\\]` 拒绝**任意位置**的冒号,所以 `/docs/1?ts=10:30` 这类合法路径被误拒,
静默回落 `/workspace` —— 用户丢失回跳目标,且无任何提示。

**彻底修复**:冒号检查限定在 **path 首段**(`?` 与 `#` 之前的第一个 `/` 分段),
query/hash 里的冒号放行。与 #4 一起在同一次重写里完成。

**验证**:`/docs/1?ts=10:30` 必须判为安全;`/javascript:alert(1)` 必须拒绝。

---

### 🟡 #6 `build-config.test.ts` 锁在源码文本层

**证据** `tests/unit/build-config.test.ts:12-16`

```js
expect(source).toContain('chunkSizeWarningLimit: 3000')
expect(source).toContain('manualChunks: resolveVendorChunk')
expect(source).toContain('vendor-ant-design')
```

对 `nuxt.config.ts` 的**源码字符串**做匹配,不验证实际产出的 chunk。
而 `resolveVendorChunk` 依赖 **11 条硬编码路径片段**(`/@tiptap/`、`/prosemirror-`、`/mammoth/`、`/katex/` …)。

**依赖升级换了目录结构 → 分包静默退化 → 测试照样绿。**

**彻底修复(不留兼容层)**

1. **删除**全部 `toContain(source)` 断言
2. 改为对**构建产物**断言:读 `.output/public/_nuxt/` 的 chunk 清单,断言
   `vendor-ant-design` / `vendor-editor-document` / `vendor-vue` / `vendor-upload` 四个 chunk **实际存在**
   且各自体积在预算内
3. 该测试标记为需要 `.output`;`pnpm quality` 里 `test` 在 `build` **之前**跑,
   所以需调整 `quality` 脚本顺序,或让该测试在缺少 `.output` 时**显式 skip 并告警**
   —— ⚠️ **不允许静默 pass**

**验证**:临时把 `resolveVendorChunk` 里 `ant-design-vue` 分支删掉 → 测试必须失败。

**风险**:中。这项会改动 `quality` 脚本的执行顺序,需确认 CI(`.github/workflows/quality.yml`)仍成立。

---

### 🟡 #7 `editor → workspace` 运行时耦合

**证据**:6 处跨 feature 引用,其中引入的是**运行时函数**而非仅类型:

| 文件                                                | 引入                                                                                             |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `features/editor/types.ts`                          | `type WorkspaceProject`                                                                          |
| `features/editor/composables/useEditorTitle.ts`     | `type WorkspaceProject`                                                                          |
| `features/editor/composables/useEditorPage.ts`      | `fetchWorkspaceProject` `getWorkspaceDocPath` `getWorkspaceNewDocPath` `isNewWorkspaceProjectId` |
| `features/editor/composables/useDraftProject.ts`    | `type CreateWorkspaceProjectPayload` `type WorkspaceProject`                                     |
| `features/editor/composables/useEditorWorkspace.ts` | `createWorkspaceProject` `getWorkspaceDocPath` `updateWorkspaceProject`                          |
| `features/editor/components/EditorWorkspace.vue`    | `type WorkspaceProject`                                                                          |

走 barrel 是对的(尊重公开接口),但事实是 **`editor` 已无法脱离 `workspace` 存在**。
`workspace/index.ts` 文件头自己也承认:「`WORKSPACE_NEW_PROJECT_ID = 'new'` 与 editor 首次保存流程耦合」。

**彻底修复(不留兼容层)**

1. 新建 `app/api/workspace-project.ts`(数据访问)+ `app/types/workspace-project.ts`(类型),
   把 6 个共享符号(`WorkspaceProject`、`CreateWorkspaceProjectPayload`、`fetchWorkspaceProject`、
   `createWorkspaceProject`、`updateWorkspaceProject`、`getWorkspaceDocPath`、
   `getWorkspaceNewDocPath`、`isNewWorkspaceProjectId`)**移动**过去
2. `features/workspace` 与 `features/editor` **都改为从新位置引入**
3. 🔴 **`features/workspace/index.ts` 不保留任何 re-export shim** —— 这是本次约束的重点
4. `page-structure.test.ts`(#1 已重写)追加断言:**任意 feature 不得引用其它 feature**
   —— 用测试锁住这条边界,防止再犯

**验证**:#1 的新测试必须能拦住跨 feature 引用;`editor` 目录下 `grep features/workspace` 为空。

**风险**:中。移动 8 个符号会波及两个 feature 的多个文件与其单测(`workspace-projects.test.ts`、
`editor-draft-project.test.ts`、`editor-title.test.ts` 等),需一次改完。

---

### 🟡 #9 `.env.prod` 被 gitignore 白名单强制提交

**证据** `.gitignore`

```
.env.*
!.env.dev
!.env.prod
!.env.test
```

当前三个文件内容都是 `replace_with_random_revalidate_secret` 这类占位符,**没有泄漏**。
用户确认 `.env.dev` / `.env.test` / `.env.prod` 是项目有意追踪的 starter 基线,不生成 `.example` 文件。
因此这里不改为 example 方案,只在文档中强调这些文件只能放非 secret 默认值,真实环境由部署平台或运行时覆盖。

**处理**

1. `.gitignore` 保持只对白名单 `.env.dev` / `.env.test` / `.env.prod` 放行
2. 不生成 `.env.*.example`
3. `package.json` 的 `--dotenv .env.dev` 等脚本保持不变
4. README / deployment 文档写明:tracked env 文件是非 secret baseline,真实环境值由部署平台、容器运行时或进程管理器覆盖

**验证**:`git ls-files | grep '^\.env'` 应出现 `.env.dev` / `.env.test` / `.env.prod`。

---

### 🟢 #10 commit type 误用

**证据**:配了 `@commitlint/config-conventional`,但实际历史是
`feat: 问题修复`、`feat: 更新包`、`feat: 更新项目文档` —— 应为 `fix` / `chore` / `docs`。
commitlint 只校验**格式**不校验**语义**,所以全部通过。

**彻底修复**:历史不改(改写公共历史代价大于收益)。
在 `README.md` 或 `docs/` 写明类型选择规则,后续提交遵守。

---

## 3. 批次与验证门槛

> **每批结束时 `pnpm quality` 必须全绿才算完成。**
> `quality` = lint + format:check + stylelint + typecheck + i18n:check + build + test
> 另外每批都要跑 `pnpm docs:sync:check` —— 新增/移动文件必须补 `【文件职责】` 头,否则它会红。

| 批次     | 内容         | 预期   | 说明                                                                   |
| -------- | ------------ | ------ | ---------------------------------------------------------------------- |
| **B1**   | #4 #5 #9 #10 | 0.5 天 | 全是低风险独立改动,先清场                                              |
| **B2**   | #1           | 0.5 天 | ⚠️ **顺序不可反**:先改测试让它**红**,再修 `pages/docs/[id].vue` 让它绿 |
| **B3**   | #2 #3        | 1 天   | 同一端点一起改。#2 的 207/500 守卫先上,再补集成测试                    |
| **B4**   | #7           | 1–2 天 | 依赖 B2 的新测试来锁边界,不能提前做                                    |
| **B5**   | #6           | 0.5 天 | 会动 `quality` 脚本顺序,单独一批便于回滚                               |
| **决策** | #8           | —      | 见 §4,需你拍                                                           |

**合计 B1–B5 ≈ 3.5–4.5 天。**

### 每批的自检清单

1. `pnpm quality` 全绿
2. `pnpm docs:sync:check` 全绿(移动/新增文件都补了文件头)
3. **反向验证**:故意引入该缺陷 → 新增的检查必须失败
   —— 这一条最重要,否则等于没修(参见 §0:本项目的缺陷全部是"检查存在但拦不住")

---

## 4. 🔴 #8 CSP 需要你决策:它与 prerender/SWR 有硬冲突

**现状** `nuxt.config.ts:136`

```
script-src 'self' 'unsafe-inline'
```

**实测构建产物里的内联可执行脚本**(`.output/public/**/index.html`):

| 内联 script                                                 | 是否受 `script-src` 管 |
| ----------------------------------------------------------- | ---------------------- |
| `<script data-hid="theme-init">`(项目自有,主题初始化防闪烁) | 🔴 **是**              |
| `<script>`(Nuxt 水合引导,每页 1 个)                         | 🔴 **是**              |
| `<script type="application/json" id="__NUXT_DATA__">`       | ✅ 不是(数据块,不执行) |
| `<script type="application/ld+json">`                       | ✅ 不是                |

所以去掉 `'unsafe-inline'` 必须给那 2 类内联脚本提供 **nonce 或 hash**。

### 冲突在哪

| 方案                     | 问题                                                                                                                                                                                              |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **nonce**                | nonce 必须**每个响应唯一**。但本项目有 `prerender: true`(构建期生成静态 HTML)和 `swr: 3600`(缓存 SSR 结果)—— **缓存的 HTML 里 nonce 是写死的**,复用即失效。**nonce 与本项目的缓存策略根本不兼容** |
| **hash**                 | 可行,但 `theme-init` 与 Nuxt 引导脚本的内容**随构建变化**,必须在构建后提取真实内联脚本内容算 SHA-256 再注入 header。Nuxt 无内置支持,需自写 Nitro `render:html` 钩子或后置脚本                     |
| **引入 `nuxt-security`** | 它主打 nonce,同样撞上缓存问题;且违反"不引入新依赖"的倾向                                                                                                                                          |
| **把内联脚本外置**       | `theme-init` 可以改成外部 `.js`(但会引入一次额外往返,且主题防闪烁的意义就是要在首帧前执行 —— 外置会重新引入闪烁);Nuxt 的水合引导脚本**不受我们控制**                                              |

### 我的判断

**在保留 prerender/SWR 的前提下,唯一正确路线是「构建期 hash 提取 + 注入」** ——
不是一次改动,是一个需要维护的构建步骤(Nuxt 升级换了引导脚本就得重算)。
估 **2–3 天 + 长期维护成本**,且有做不通的可能(Nuxt 引导脚本内容不稳定)。

**另一个诚实的选项**:承认 `script-src 'unsafe-inline'` 是**缓存策略换来的已知代价**,
在 `nuxt.config.ts` 文件头写清楚「为什么不能去掉」,并把 XSS 防线放在
输出转义 + `v-html` 审计上。**这不是留兼容层,是记录一个约束。**

**需要你选**:

- **A** 立项做构建期 hash 注入(2–3 天,有失败可能,长期维护)
- **B** 保留 `unsafe-inline` 并在配置里写明原因与补偿措施(0.5 天)
- **C** 放弃 prerender/SWR 换 nonce —— ❌ 我不建议,代价远大于收益

---

## 5. 贯穿性根因(修复时要一直记着)

本项目最严重的三条缺陷是**同一类**:

| #   | 测试锁的是                       | 该锁的是                             |
| --- | -------------------------------- | ------------------------------------ |
| 1   | 硬编码 4 个文件名 + 只拦相对路径 | 遍历 `pages/**` + 拦所有 import 形式 |
| 2   | cache key 的**前缀**和幂等性     | key 真的命中 Nitro 写入的条目        |
| 6   | `nuxt.config.ts` 的**源码文本**  | `.output` 里实际产出的 chunk         |

> **测试锁在了错误的层。**

这个项目的守护机制(`docs-sync` 1,988 行、架构守护测试、7 项 quality gate)
**设计得比一般项目好得多** —— 恰恰因此更容易产生「已经被守住了」的错觉,
让这类缺陷更难被发现。

**所以本计划的每一条都强制要求「反向验证」**:故意引入缺陷,新增的检查必须失败。
不能反向验证的修复,视为未完成。
