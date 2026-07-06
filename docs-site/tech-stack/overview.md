# 技术栈总览

## 核心依赖

| 包                                                                           | 版本  | 角色                                  |
| ---------------------------------------------------------------------------- | ----- | ------------------------------------- |
| [Nuxt](https://nuxt.com/)                                                    | 4.4.8 | 全栈 Vue 框架、文件路由、Nitro 服务端 |
| [Vue](https://vuejs.org/)                                                    | 3.5.x | UI 运行时                             |
| [TypeScript](https://www.typescriptlang.org/)                                | 5.9   | 类型安全，`strict: true`              |
| [Pinia](https://pinia.vuejs.org/)                                            | 3.x   | 客户端状态                            |
| [vue-i18n](https://vue-i18n.intlify.dev/)                                    | 11.x  | 国际化                                |
| [Ant Design Vue](https://antdv.com/)                                         | 4.2.x | 组件库                                |
| [@yanivjs/yaniv-editor](https://www.npmjs.com/package/@yanivjs/yaniv-editor) | 0.1.x | 富文本编辑器                          |

## 开发工具链

| 工具                  | 用途          |
| --------------------- | ------------- |
| pnpm 11               | 包管理        |
| ESLint + @nuxt/eslint | 代码质量      |
| Prettier              | 格式化        |
| Stylelint             | SCSS/Vue 样式 |
| Vitest + happy-dom    | 单元测试      |
| @nuxt/test-utils      | Nuxt 环境测试 |
| Husky + lint-staged   | Git 提交门禁  |
| vue-tsc               | 类型检查      |

## 架构相关选型理由

### 为什么 Nuxt 4？

- 文件系统路由 + `routeRules` 原生支持 SSR/prerender/SWR/CSR 混合
- Nitro 统一 server 层（sitemap、middleware）
- 与 Vue 3 Composition API 深度集成

### 为什么不用 @nuxtjs/i18n？

公开页需要 URL 前缀，产品页需要 **语言中性 URL**。自建 middleware + helper 更可控，避免模块默认行为与产品区冲突。

### 为什么 Ant Design Vue？

- 企业级组件覆盖表单、布局、反馈
- `@ant-design-vue/nuxt` 支持 `extractStyle` SSR 样式提取
- 图标按需加载（`app/utils/antdIcon.ts`）

### 为什么 Feature-first？

避免 `components/`、`stores/` 无限膨胀；每个业务域自带 API、UI、类型，边界清晰，利于多人协作。

## 样式体系

- `config/theme.ts` — Ant Design token
- `app/assets/styles/tokens.scss` — CSS 变量
- 页面优先用 semantic CSS 变量，避免硬编码品牌色

## 与后端契约

- REST JSON API
- 统一 `{ code, message, data }`
- Bearer Token 鉴权
- 联调项目：`nuxt-modern-starter-api`

## 下一步

- [Nuxt 4 在本项目中的用法](/tech-stack/nuxt)
- [HTTP 请求层](/tech-stack/http)
