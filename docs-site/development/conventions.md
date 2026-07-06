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

## 安全

- 不 log token/cookie（headers 已脱敏）
- 登录 redirect 用 `resolveSafeRedirectPath()`
- 归因数据只在 `logout()` 清除
- analytics 默认关闭，启用需改 CSP

## 格式化

| 工具      | 职责                         |
| --------- | ---------------------------- |
| Prettier  | JS/TS/Vue/Markdown 格式      |
| ESLint    | 语义检查，`--max-warnings 0` |
| Stylelint | SCSS/Vue style               |

提交时 Husky 跑 lint-staged + lint/stylelint/typecheck/test。

## Vue 模板

空元素保持 Prettier 自闭合格式 `<div />`，与 ESLint 对齐。

## 下一步

- [测试与质量](/development/testing)
