# 快速开始

## 环境要求

| 工具 | 版本    |
| ---- | ------- |
| Node | 22.22.3 |
| pnpm | 11.5.2  |

```bash
corepack enable
node -v   # 应 >= 22.22.3
pnpm -v   # 应 >= 11.5.2
```

## 安装与启动

```bash
git clone <repo-url> nuxt-modern-starter
cd nuxt-modern-starter
pnpm install
pnpm dev
```

浏览器访问：

- 默认中文：`http://localhost:3000`
- 英文：`http://localhost:3000/en`

默认读取 `.env.dev` 环境层。

## 与后端 API 联调

若配合 `nuxt-modern-starter-api` 使用：

1. 先启动后端 Docker 栈（推荐 `pnpm docker:dev`）
2. 保持前端 `.env.dev`：

```bash
NUXT_PUBLIC_API_BASE=http://localhost:2026/api
```

3. 后端 `CORS_ORIGINS` 包含 `http://localhost:3000`
4. 登录后验证 `/workspace`、`/docs/new`、`/account`

## 常用命令

```bash
pnpm dev          # 本地开发（.env.dev）
pnpm test         # 单元测试
pnpm typecheck    # TypeScript 检查
pnpm lint         # ESLint
pnpm quality      # 发布前全量门禁
pnpm docs:dev     # 预览本文档站
```

## 30 分钟上手路径

1. **跑起来** — `pnpm install && pnpm dev`，浏览首页、价格、关于、帮助、新闻
2. **看架构** — 阅读 [项目概览](/guide/overview) 与 [架构总览](/architecture/overview)
3. **走一遍产品流** — 注册 → 登录 → 工作台创建项目 → 编辑器自动保存
4. **接一个小需求** — 按 [添加公开页面](/development/add-page) 或 [添加功能模块](/development/add-feature) 动手

## 下一步

- [项目概览](/guide/overview) — 这个项目解决什么问题
- [目录结构](/architecture/directory) — 每个文件夹干什么
- [添加公开页面](/development/add-page) — 第一个开发任务
