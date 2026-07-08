# 编码约定

## 配置边界

| 层         | 文件                              | 放什么                       |
| ---------- | --------------------------------- | ---------------------------- |
| 部署配置   | `runtimeConfig` / `.env.*`        | API 地址、siteUrl、analytics |
| UI 默认    | `app/app.config.ts`               | 品牌文案、layout 开关        |
| 站点元数据 | `config/site.ts`                  | 语言、导航、公开页路径       |
| 路由规则   | `config/routes.ts`                | prerender/SWR/CSR            |
| 鉴权常量   | `config/auth.ts`                  | 端点、cookie、过期时间       |
| 主题       | `config/theme.ts` + `tokens.scss` | 设计 token                   |

## 命名

- Vue 组件：`PascalCase`
- Composables：`useXxx`
- Config 导出：typed named exports

## 页面职责

页面文件 **只做**：

- `definePageMeta`
- `usePageSeo`
- 挂载 feature 组件

不要在页面里重复 locale 前缀、API base、SEO URL 拼接逻辑。

## 请求分层

见 [HTTP 请求层](/tech-stack/http)。核心原则：

- 公开 adapter 不碰 token
- 业务 payload 在 `data` 里
- `code === 200` 才成功

## 格式化与工具链

| 工具           | 职责                                                                    |
| -------------- | ----------------------------------------------------------------------- |
| Prettier       | JS/TS/Vue/Markdown/JSON/CSS/SCSS 格式化（单一来源）                     |
| ESLint         | 代码质量与 Vue 语义；`--max-warnings 0`                                 |
| Stylelint      | SCSS/CSS/Vue style 块                                                   |
| Husky          | pre-commit：`lint-staged` → `lint` → `stylelint` → `typecheck` → `test` |
| `pnpm quality` | 发布门禁：上述 + `format:check` + `i18n:check` + `build`                |

提交时 staged 文件先 `prettier --write`，再 `eslint --fix --max-warnings 0`。

## Vue 模板

空元素保持 Prettier 自闭合格式（`<div />`），与 ESLint 对齐，避免两者冲突。

## 安全与无障碍

- 不 log token/cookie（headers 已脱敏）
- 登录 redirect 用 `resolveSafeRedirectPath()`
- 归因数据只在 `logout()` 清除，不在 `reset()` 或 `clearAuthSession()` 中清除
- analytics 默认关闭，启用需同步更新 `nuxt.config.ts` 的 CSP `script-src`
- 第三方脚本仅在明确需求下加载；交互控件需可访问标签、可见焦点与键盘支持
- 面向欧盟等需 consent 的地区，fork 项目需自行添加 CMP（starter 未内置）

## 下一步

- [测试与质量](/development/testing)
