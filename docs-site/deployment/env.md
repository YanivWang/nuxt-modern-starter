# 环境变量

## 公开变量（committed 示例）

`.env.dev` / `.env.test` / `.env.prod`：

```bash
NUXT_PUBLIC_SITE_URL=http://localhost:3000
NUXT_PUBLIC_API_BASE=http://localhost:2027/api

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

| 变量                                   | runtimeConfig 键                | 说明                      | 本地默认                    |
| -------------------------------------- | ------------------------------- | ------------------------- | --------------------------- |
| `NUXT_PUBLIC_SITE_URL`                 | `public.siteUrl`                | SEO canonical、sitemap    | `http://localhost:3000`     |
| `NUXT_PUBLIC_API_BASE`                 | `public.apiBase`                | 后端 API 根（含 `/api`）  | `http://localhost:2027/api` |
| `NUXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | `public.googleSiteVerification` | Google 站长验证           | 空                          |
| `NUXT_PUBLIC_BAIDU_SITE_VERIFICATION`  | `public.baiduSiteVerification`  | 百度验证                  | 空                          |
| `NUXT_PUBLIC_ANALYTICS_ENABLED`        | `public.analyticsEnabled`       | 必须精确为 `true` 才启用  | `false`                     |
| `NUXT_PUBLIC_ANALYTICS_SCRIPT_SRC`     | `public.analyticsScriptSrc`     | 第三方脚本 URL            | 空                          |
| `NUXT_PUBLIC_ANALYTICS_DEFER_MS`       | `public.analyticsDeferMs`       | 延迟毫秒                  | `3000`                      |
| `NUXT_APP_ENV`                         | `public.appEnv`                 | 控制 cookie `secure`      | `development`               |
| `NUXT_REVALIDATE_SECRET`               | `revalidateSecret`              | SWR 按需失效 webhook 密钥 | 示例占位符（生产须替换）    |

## NUXT_APP_ENV 与 Cookie

`app/utils/auth-session.ts`：

```ts
secure: config.public.appEnv === 'production'
```

| 环境          | 设置方式                  | cookie secure |
| ------------- | ------------------------- | ------------- |
| 本地 pnpm dev | 默认 `development`        | false         |
| Docker 生产栈 | Compose 注入 `production` | true          |
| Docker 开发栈 | Compose 注入 `dev`        | false         |

**生产 HTTPS 登录** 必须 `NUXT_APP_ENV=production` + HTTPS。

## 生产注意

- 不要把真实 `.env.prod` 密钥打进 Docker 镜像
- 容器/平台运行时注入 `NUXT_*`
- `siteUrl` 生产必须改为真实域名

## 下一步

- [Docker](/deployment/docker)
- [配置文件参考](/reference/config)
