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
| `appEnv`                 | `NUXT_PUBLIC_APP_ENV`                  |
| `apiBase`                | `NUXT_PUBLIC_API_BASE`                 |
| `siteUrl`                | `NUXT_PUBLIC_SITE_URL`                 |
| `googleSiteVerification` | `NUXT_PUBLIC_GOOGLE_SITE_VERIFICATION` |
| `baiduSiteVerification`  | `NUXT_PUBLIC_BAIDU_SITE_VERIFICATION`  |
| `analyticsEnabled`       | `NUXT_PUBLIC_ANALYTICS_ENABLED`        |
| `analyticsScriptSrc`     | `NUXT_PUBLIC_ANALYTICS_SCRIPT_SRC`     |
| `analyticsDeferMs`       | `NUXT_PUBLIC_ANALYTICS_DEFER_MS`       |

客户端和服务端均可 `useRuntimeConfig().public` 访问。

### 服务端 runtimeConfig

`revalidateSecret`（`NUXT_REVALIDATE_SECRET`）只在服务端可见，不进 `public`，供
`server/api/revalidate.post.ts` 校验 `x-revalidate-secret`。

### nitro.storage

SWR 页面缓存的存储驱动，由 `config/cache.ts` 的 `resolveCacheStorage()` 在**构建期**求值：

```ts
nitro: {
  storage: resolveCacheStorage() // memory → {}；fs → { cache: { driver: 'fsLite', base } }
}
```

默认进程内存，多实例部署需换共享驱动 —— 见[部署概览](/deployment/overview#swr-页面缓存与多实例)。

### vite.build

内置富文本编辑器体积较大，用显式 `manualChunks` 切出 `vendor-ant-design`、
`vendor-editor-document`、`vendor-vue`、`vendor-upload` 四个 vendor chunk，
并把 `chunkSizeWarningLimit` 放宽到 3000KB。分包是否真的生效由
`tests/unit/build-config.test.ts` 读 `.output` 产物校验。

### 其他要点

- `compatibilityDate: '2026-07-04'`
- `antd.extractStyle: true` — SSR 提取 Ant Design CSS-in-JS 样式
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
