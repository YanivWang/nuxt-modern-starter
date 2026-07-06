---
layout: home

hero:
  name: Nuxt Modern Starter
  text: 完整架构文档
  tagline: 面向公开站点与轻量 SaaS 前台的 Nuxt 4 starter — 从零理解目录、路由、请求、鉴权、SEO 与部署
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 架构总览
      link: /architecture/overview

features:
  - icon: 🏗️
    title: 双区架构
    details: 公开 SEO 站与登录产品区分离：路由、渲染、数据、模块边界清晰，新人可按图索骥写代码。
  - icon: ⚡
    title: 混合渲染
    details: SSR + prerender + SWR + CSR 按路由分层，营销页可缓存，编辑器/工作台保持会话感知。
  - icon: 🔌
    title: 分层请求
    details: public / auth / product 三类 API 客户端，统一 { code, message, data } 信封与 401 单飞刷新。
  - icon: 🌐
    title: 自建 i18n
    details: 不依赖 @nuxtjs/i18n；公开页 /en 前缀，产品区 URL 语言中性，UI 语言独立切换。
  - icon: 🔐
    title: 可选鉴权
    details: Bearer Token + Cookie + Pinia，命名 auth 中间件保护产品路由，支持 RBAC 扩展位。
  - icon: 🚀
    title: 部署就绪
    details: Nitro node-server、Docker、Compose、Nginx 样例与完整环境变量说明。
---

## 文档适合谁读？

- **刚加入项目的前端**：按「指南 → 架构 → 开发」顺序阅读，30 分钟内建立全局心智模型。
- **需要接功能的同学**：直接看 [开发指南](/development/add-page)，按场景查「代码该写在哪」。
- **负责部署的工程师**：看 [部署概览](/deployment/overview) 与 [环境变量](/deployment/env)。

## 与仓库内 docs/ 的关系

| 位置                 | 用途                                                 |
| -------------------- | ---------------------------------------------------- |
| `docs-site/`（本站） | 面向新人的完整架构与开发手册，VitePress 站点         |
| `docs/*.md`          | 仓库内精简约定，供 README / help 页引用              |
| 应用内 `/help`       | 面向终端用户的 FAQ，数据来自 `config/content/faq.ts` |

本地预览文档站：

```bash
pnpm docs:dev
```

构建静态站点：

```bash
pnpm docs:build
pnpm docs:preview
```
