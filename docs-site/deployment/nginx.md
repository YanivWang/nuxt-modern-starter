# Nginx 网关

样例配置：`docker/nginx/gateway.docker.conf`

## 职责

1. 反向代理到 Nuxt upstream `nuxt:3000`
2. 对 `/_nuxt/` 静态资源设置长缓存

```txt
Cache-Control: public, max-age=31536000, immutable
```

## 请求路径

| 路径                  | 处理方式                                            |
| --------------------- | --------------------------------------------------- |
| `/`、`/news/*` 等页面 | 代理到 Nuxt                                         |
| `/_nuxt/*`            | 代理 + 长缓存                                       |
| `/api/*`              | **不经过 Nginx**，浏览器直连 `NUXT_PUBLIC_API_BASE` |

因此前后端分离部署时，必须在 **后端或 API 网关** 配置 CORS。

## 生产增强（需自行添加）

样例 **不包含** 以下生产必备项，fork 时请补充：

- TLS/HTTPS 终止
- gzip/brotli 压缩
- 访问日志与监控
- upstream 健康检查
- rate limiting

## 验证

```bash
pnpm docker:up
curl -I http://localhost:3000/_nuxt/某个hash.js
# 应看到 Cache-Control: public, max-age=31536000, immutable
```

## 下一步

- [部署概览](/deployment/overview)
- [环境变量](/deployment/env)
