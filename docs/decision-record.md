# Decision Record

## v0.1 技术冻结

记录日期：2026-07-04

### 已验证版本

| 项目                 | 版本    |
| -------------------- | ------- |
| Node                 | 22.22.3 |
| pnpm                 | 11.5.2  |
| Nuxt                 | 4.4.8   |
| vue-i18n             | 11.4.6  |
| @pinia/nuxt          | 0.11.3  |
| pinia                | 3.0.4   |
| ant-design-vue       | 4.2.6   |
| @ant-design-vue/nuxt | 1.4.6   |
| vitest               | 4.1.9   |
| @nuxt/test-utils     | 4.0.3   |

### Nuxt 和部署

- v0.1 采用 Nuxt 4、TypeScript、pnpm、`app/` 目录结构。
- 默认部署目标为 Nitro `node-server`，生产启动命令为 `node .output/server/index.mjs`。
- Nitro 文档确认 `devProxy` 是开发服务器代理配置，v0.1 只允许把它用于本地开发，不把它当作生产反代或后端路由方案。
- Docker 和 Nginx 样例以及实跑验证进入完整 v0.1-core；Playwright E2E 和远程 CI 不进入 v0.1。

### Ant Design Vue 接入

- 优先采用 `@ant-design-vue/nuxt` 模块。Nuxt Modules 页面说明该模块提供组件、图标、message/notification/Modal 的自动导入，并支持 `extractStyle` 处理按需样式抽取。
- Ant Design Vue 官方 Vue 文档说明全量安装时需要额外引入样式；Nuxt 模块方案负责 Nuxt 场景下的自动接入。
- 已知风险：Ant Design Vue 的 Menu、Dropdown、Select 等交互组件在 SSR 中可能出现 hydration mismatch。v0.1 基础页面先使用低风险组件，并开启 `extractStyle`。
- 兜底标准已冻结：如果出现安装阻塞、SSR 样式异常、build 失败、类型冲突或主题 token 无法接入，则改用手动 plugin + `ConfigProvider` token 注入方案。

### 测试策略

- Nuxt 4 官方测试文档推荐 `@nuxt/test-utils` 搭配 Vitest；需要 Nuxt 运行时的测试放在 Nuxt environment 中。
- server routes、middleware、composable、redirect/status code 相关测试默认使用 `environment: 'nuxt'`。
- 纯函数测试可以放在普通 unit 测试中；v0.1 不引入 Playwright E2E。

### 请求上下文和 header

- Nuxt `useRequestFetch` 文档确认：服务端请求需要手动转发请求上下文和 headers；`useFetch` 在服务端会使用 `useRequestFetch` 转发请求上下文和 headers。
- Nuxt 文档同时说明不会转发不适合转发的 headers，例如 `transfer-encoding`、`connection`、`keep-alive`、`upgrade`、`expect`、`host`、`accept`。
- v0.1 的外部 API 请求采用白名单策略，只显式转发 `cookie`、`authorization`、`x-request-id`、`accept-language`，且错误日志和客户端错误对象不得泄露敏感字段。

### 内部迁移参考

- 当前工作区未找到 `aippt-home` 参考项目文件，因此本轮不能直接核对其 `i18n/index.ts`、`plugins/i18n.ts`、`middleware/default.global.ts`、`store/language.ts` 和 `pages/[[language]]/...`。
- 该项目名只允许出现在本决策记录中；README、usage、architecture 和 conventions 不得出现内部参考项目名。
- 后续如果补充参考项目，可只吸收语言路由、语言 store、i18n 插件和默认语言重定向的通用做法，必须剥离登录跳转、埋点、业务语言列表、业务路由和后台依赖。

### v0.1-core 边界

- v0.1-core 只交付 Nuxt 基础、配置中心、layout、i18n、轻量请求入口、SEO 入口、示例页面、robots/sitemap、基础单测、build、Docker/Nginx 样例和实跑验证。
- 不创建 auth 运行时代码占位；auth 只在使用文档中写扩展契约。
- analytics、CMS、支付、会员、上传、更多语言、Playwright E2E、远程 CI 不进入核心闭环。
