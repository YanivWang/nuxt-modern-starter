# Nuxt 4

## 项目中的 Nuxt 配置要点

配置文件：`nuxt.config.ts`

### 模块

```ts
modules: ['@pinia/nuxt', '@ant-design-vue/nuxt', '@nuxt/eslint']
```

测试环境额外加载 `@nuxt/test-utils/module`。

### 组件自动导入

```ts
components: [{ path: '~/components', pathPrefix: false }]
```

`app/components/base/BaseButton.vue` → 模板中直接用 `<BaseButton />`。

### routeRules

从 `config/routes.ts` 展开：

```ts
routeRules: {
  '/': { prerender: true },
  '/news/**': { swr: 3600 },
  '/workspace/**': { ssr: false },
  '/**': { headers: { /* CSP 等 */ } }
}
```

### runtimeConfig.public

| 键                       | 环境变量                               |
| ------------------------ | -------------------------------------- |
| `appEnv`                 | `NUXT_APP_ENV`                         |
| `apiBase`                | `NUXT_PUBLIC_API_BASE`                 |
| `siteUrl`                | `NUXT_PUBLIC_SITE_URL`                 |
| `googleSiteVerification` | `NUXT_PUBLIC_GOOGLE_SITE_VERIFICATION` |
| `baiduSiteVerification`  | `NUXT_PUBLIC_BAIDU_SITE_VERIFICATION`  |
| `analyticsEnabled`       | `NUXT_PUBLIC_ANALYTICS_ENABLED`        |
| `analyticsScriptSrc`     | `NUXT_PUBLIC_ANALYTICS_SCRIPT_SRC`     |
| `analyticsDeferMs`       | `NUXT_PUBLIC_ANALYTICS_DEFER_MS`       |

客户端和服务端均可 `useRuntimeConfig().public` 访问。

### 其他要点

- `compatibilityDate: '2026-07-04'`
- 全局 `/**` routeRules 注入 CSP、X-Frame-Options、nosniff 等安全响应头
- 测试环境（`NODE_ENV=test` 或 `VITEST`）额外加载 `@nuxt/test-utils/module`

## 目录约定（Nuxt 4）

本项目使用 Nuxt 4 的 `app/` 作为源码根（非 legacy 的根级 `pages/`）。

```
app/
├── pages/       # 文件路由
├── layouts/     # 布局
├── middleware/  # 路由中间件
├── plugins/     # 插件
├── components/  # 组件
└── ...
```

## 数据获取

| 场景            | 推荐方式                                  |
| --------------- | ----------------------------------------- |
| 公开页 SSR 数据 | `useAsyncData` + public API               |
| 产品页 CSR 数据 | `useAsyncData` 或 onMounted + product API |
| 全局 session    | Pinia auth store + auth plugin            |

## 构建输出

`pnpm build` → `.output/` → Nitro `node-server`：

```bash
node .output/server/index.mjs
```

## 下一步

- [路由与渲染](/architecture/routing)
- [Pinia 状态管理](/tech-stack/pinia)
