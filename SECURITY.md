# 安全策略

## 报告漏洞

请勿通过公开 issue 报告安全问题。发邮件到 yanivwang@gmail.com，包含：

- 受影响的版本或提交 hash
- 复现步骤
- 你评估的影响面

我们会在收到后尽快确认，并在修复发布后同步致谢（如你愿意署名）。

## 本项目已内置的安全边界

以下机制有测试或门禁守护，改动时请勿绕过：

| 边界                                        | 位置                                  | 守护                                                                       |
| ------------------------------------------- | ------------------------------------- | -------------------------------------------------------------------------- |
| 令牌不得进入 SSR payload                    | `app/utils/auth-session.ts`           | `tests/unit/ssr-cache-safety.test.ts`                                      |
| 公开请求必须剥离 `authorization` / `cookie` | `app/api/clients.ts`                  | `tests/unit/api-clients.test.ts`                                           |
| 登录跳转必须过开放重定向校验                | `app/utils/safe-redirect.ts`          | `tests/unit/safe-redirect.test.ts`、`tests/component/sign-in-page.test.ts` |
| 缓存失效端点常量时间比对 + 限流             | `server/api/revalidate.post.ts`       | `tests/unit/revalidate.test.ts`                                            |
| 客户端错误上报端点限流与入参归一化          | `server/api/telemetry/errors.post.ts` | `tests/unit/error-report.test.ts`                                          |
| 日志敏感字段脱敏                            | `server/utils/logger.ts`              | `tests/unit/observability.test.ts`                                         |
| 全局安全响应头与 CSP                        | `nuxt.config.ts`                      | `tests/e2e/specs/public-site.spec.ts`                                      |

## 已知的显式取舍

- CSP 保留 `script-src 'unsafe-inline'`：prerender / SWR 缓存的 HTML 无法使用每请求唯一的 nonce。
  移除它需要实现构建期 hash 注入，见 `nuxt.config.ts` 中的说明。
- 限流按进程内存计数：横向扩容后真实配额是 `实例数 × 单实例配额`。需要精确全局限流时在网关层补。
- `.env.dev` / `.env.test` / `.env.prod` / `.env.e2e` 是**非密**基线，随仓库追踪。
  真实密钥必须由平台、容器或进程管理器在运行时注入，不要写进这些文件。
