# 环境变量

## 公开变量（committed 示例）

`.env.dev` / `.env.test` / `.env.prod`：

```bash
NUXT_PUBLIC_APP_ENV=development
NUXT_PUBLIC_SITE_URL=http://localhost:3000
NUXT_PUBLIC_API_BASE=http://localhost:2027/api/v1

NUXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
NUXT_PUBLIC_BAIDU_SITE_VERIFICATION=

NUXT_PUBLIC_ANALYTICS_ENABLED=false
NUXT_PUBLIC_ANALYTICS_SCRIPT_SRC=
NUXT_PUBLIC_ANALYTICS_DEFER_MS=3000
```

## 服务端变量（非 public）

`.env.dev` / `.env.test` / `.env.prod` 示例：

```bash
NUXT_REVALIDATE_SECRET=replace_with_random_revalidate_secret
```

用于 `POST /api/revalidate` 的 `x-revalidate-secret` 鉴权。未配置时接口返回 503。生产环境请替换为随机强密钥，运行时注入，不要打进 Docker 镜像。

## 完整变量表

| 变量                                   | runtimeConfig 键                | 说明                                            | 本地默认                        |
| -------------------------------------- | ------------------------------- | ----------------------------------------------- | ------------------------------- |
| `NUXT_PUBLIC_SITE_URL`                 | `public.siteUrl`                | SEO canonical、sitemap                          | `http://localhost:3000`         |
| `NUXT_PUBLIC_API_BASE`                 | `public.apiBase`                | 后端 API 根（含 `/api/v1`）                     | `http://localhost:2027/api/v1`  |
| `NUXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | `public.googleSiteVerification` | Google 站长验证                                 | 空                              |
| `NUXT_PUBLIC_BAIDU_SITE_VERIFICATION`  | `public.baiduSiteVerification`  | 百度验证                                        | 空                              |
| `NUXT_PUBLIC_ANALYTICS_ENABLED`        | `public.analyticsEnabled`       | 必须精确为 `true` 才启用                        | `false`                         |
| `NUXT_PUBLIC_ANALYTICS_SCRIPT_SRC`     | `public.analyticsScriptSrc`     | 第三方脚本 URL                                  | 空                              |
| `NUXT_PUBLIC_ANALYTICS_DEFER_MS`       | `public.analyticsDeferMs`       | 延迟毫秒                                        | `3000`                          |
| `NUXT_PUBLIC_APP_ENV`                  | `public.appEnv`                 | 控制 cookie `secure`                            | `development`                   |
| `NUXT_REVALIDATE_SECRET`               | `revalidateSecret`              | SWR 按需失效 webhook 密钥                       | 示例占位符（生产须替换）        |
| `NUXT_CACHE_DRIVER`                    | —（构建期读）                   | SWR 缓存驱动：`memory` \| `fs`                  | `memory`                        |
| `NUXT_CACHE_FS_BASE`                   | —（构建期读）                   | `fs` 驱动的存储目录                             | `./.data/cache`                 |
| `NUXT_TRUSTED_PROXY_DEPTH`             | —（运行时读）                   | 本服务前面的可信反向代理层数                    | `0`                             |
| `NUXT_LOG_LEVEL`                       | —（进程启动时读）               | 服务端日志级别 `debug`\|`info`\|`warn`\|`error` | `info`（`.env.dev` 为 `debug`） |
| `NUXT_PUBLIC_ERROR_REPORTING_ENABLED`  | `public.errorReportingEnabled`  | 客户端错误上报开关，设 `false` 关闭             | `true`                          |

`NUXT_CACHE_*` 不进 `runtimeConfig`：`nitro.storage` 是 **构建期** 配置，值在 `pnpm build` 时
就写进 `.output`，运行时再改环境变量无效。多实例部署的取舍见
[部署概览 — SWR 页面缓存与多实例](/deployment/overview#swr-页面缓存与多实例)。

## 可观测性

服务端日志是**单行 JSON**（`server/utils/logger.ts`），可被 Loki、CloudWatch、Datadog 这类采集器直接解析，
无需自定义 parser。`warn` / `error` 走 stderr，其余走 stdout，方便按流分级。

- `NUXT_LOG_LEVEL` 无效值不会让进程起不来，会回退到 `info`。
- 日志按键名递归脱敏（`authorization`、`cookie`、`token`、`password` 等），
  白名单唯一来源是 `config/observability.ts` 的 `SENSITIVE_KEY_PATTERNS`。
  **业务代码不要直接 `console.*`** —— 那会绕过脱敏与级别控制。
- 每个请求都有 `requestId`（沿用上游 `x-request-id`，缺失则生成），同名响应头回写，
  服务端日志、未捕获错误、客户端上报共用这一个关联键。

客户端错误（Vue 渲染错误、`window.onerror`、未处理的 Promise rejection）经
`app/plugins/error-reporter.client.ts` 去重后 POST 到第一方端点 `/api/telemetry/errors`，
由服务端写进同一条日志流。该端点有体积上限与按 IP 限流。要换成 Sentry / Datadog，
只需替换该插件里的 `send` 实现，捕获与去重逻辑不用动。

探针：

| 端点       | 用途                     | 语义                                                  |
| ---------- | ------------------------ | ----------------------------------------------------- |
| `/healthz` | liveness（进程是否活着） | 恒 200，不查任何下游；Docker Compose healthcheck 用它 |
| `/readyz`  | readiness（能否接流量）  | 运行期配置齐全返回 200，缺失返回 503 并列出缺哪些变量 |

两者分工的意义：进程活着但配置缺失时 `healthz` 200 而 `readyz` 503，
编排系统据此把实例摘出负载均衡，而不是反复重启它。

## NUXT_TRUSTED_PROXY_DEPTH 与限流

`server/utils/client-ip.ts` 用它决定客户端 IP 从哪里取，而客户端 IP 就是限流的 key。

- `0`（默认）：不看 `x-forwarded-for`，只用连接地址。适用于直接对外的部署。
- `N`：取 `x-forwarded-for` **右数第 N 项**。反向代理是往右追加真实来源的
  （nginx 的 `$proxy_add_x_forwarded_for`），所以右数第 N 项才是网关看到的客户端。

不要取最左项。最左项由客户端自己写，拿它当限流 key 时，攻击者每个请求换一个伪造 IP
就能绕过配额，还能顺带把限流器的 bucket 表撑大 —— 本该防刷的组件反而成了放大器。

仓库自带的 Compose 栈（`docker/docker-compose.base.yaml`）在 nuxt 前面只有一层 nginx 网关，
因此显式设为 `1`。跟踪的 `.env.*` 一律是 `0`：不知道拓扑时，宁可粒度粗，也不要一个可伪造的 key。

## Cookie 的 Secure 判据

`app/utils/auth-session.ts`：

```ts
secure: requiresSecureCookie(config.public.appEnv, config.public.siteUrl)
// appEnv === 'production' || siteUrl.startsWith('https://')
```

判据跟**实际传输协议**走，不跟环境标签走。只看 `appEnv === 'production'` 的话，
任何跑在 HTTPS 上却不叫 `production` 的环境（预发、灰度，以及本仓库
`.env.test` 里 `APP_ENV=test` + `SITE_URL=https://…` 的组合）都会把令牌写成
不带 `Secure` 的 cookie，一次降级到 http 的请求就能把它明文发出去。

| 环境          | `NUXT_PUBLIC_APP_ENV` | `NUXT_PUBLIC_SITE_URL`  | cookie secure |
| ------------- | --------------------- | ----------------------- | ------------- |
| 本地 pnpm dev | `development`         | `http://localhost:3000` | false         |
| E2E           | `development`         | `http://127.0.0.1:3399` | false         |
| 预发 / 测试   | `test`                | `https://…`             | true          |
| Docker 生产栈 | `production`          | `https://…`             | true          |

`appEnv === 'production'` 这一支保留下来，是为了兼容 `siteUrl` 还没配成真实
https 域名的生产部署：两条是「或」的关系，只会让 `Secure` 出现得更多。

## 生产注意

- 不要把真实 `.env.prod` 密钥打进 Docker 镜像
- 容器/平台运行时注入 `NUXT_*`
- `siteUrl` 生产必须改为真实域名

## 下一步

- [Docker](/deployment/docker)
- [配置文件参考](/reference/config)
