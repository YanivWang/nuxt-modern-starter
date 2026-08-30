# 快速开始

## 环境要求

| 工具 | 版本    |
| ---- | ------- |
| Node | 22.22.3 |
| pnpm | 11.5.2  |

`package.json` `engines` 要求 Node **>=22.22.3 <23**、pnpm **>=11.5.2 <12**；上表是验证过的版本。
精确版本锁定交给 `packageManager: pnpm@11.5.2`（corepack）与 `.nvmrc`，`engines` 用范围避免
补丁号不同就报 unsupported engine。

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

1. 在 **`nuxt-modern-starter-api` 后端仓库** 启动 Docker 栈（该仓库命令，常见为 `pnpm docker:dev`；与本前端 `pnpm docker:up:dev` 不同）
2. 保持前端 `.env.dev`：

```bash
NUXT_PUBLIC_API_BASE=http://localhost:2027/api/v1
```

对应 `nuxt.config.ts` `runtimeConfig.public.apiBase` 默认值。

3. 后端 `CORS_ORIGINS` 包含 `http://localhost:3000`
4. 登录后验证 `/workspace`（列表/删除）、从创建按钮进入 `/docs/new`、编辑器自动保存与标题编辑、`/workspace/templates` 占位页、`/account` 资料展示与退出

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
3. **走一遍产品流** — 注册 → 登录 → 从工作台进入 `/docs/new` → 编辑器首次保存创建项目
4. **接一个小需求** — 按 [添加公开页面](/development/add-page) 或 [添加功能模块](/development/add-feature) 动手

## 下一步

- [项目概览](/guide/overview) — 这个项目解决什么问题
- [目录结构](/architecture/directory) — 每个文件夹干什么
- [添加公开页面](/development/add-page) — 第一个开发任务
