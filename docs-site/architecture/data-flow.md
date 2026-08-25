# 请求与数据流

## 统一响应信封

所有业务 API 返回：

```json
{
  "code": 200,
  "message": "ok",
  "data": { ... }
}
```

- `code !== 200` → HTTP 客户端抛出错误，页面用 `getApiErrorMessage()` 展示 `message`
- 业务数据 **只在 `data` 里**，不要混在顶层
- 类型定义：`ApiResponse<T>`（`app/lib/http/types.ts`）；`assertApiSuccess` 校验 `code === 200`

## 分层架构

```
Page / Store / Feature Component
        ↓
  业务适配器（命名函数）
  ~/api/public.ts | ~/api/auth.ts | ~/api/workspace-project.ts | ~/features/*/api.ts
        ↓
  场景客户端
  createPublicApiClient | createAuthApiClient | createProductApiClient
        ↓
  createApiClient（app/lib/http/client.ts）
        ↓
  $fetch → runtimeConfig.public.apiBase（`nuxt.config.ts` 默认 `apiBase`，已含 `/api` 前缀）+ path
```

## 三类客户端对比

|               | Public                    | Auth                    | Product                     |
| ------------- | ------------------------- | ----------------------- | --------------------------- |
| 工厂函数      | `createPublicApiClient()` | `createAuthApiClient()` | `createProductApiClient()`  |
| Authorization | **删除**                  | 按需 Bearer             | 自动读 cookie + Bearer      |
| Cookie        | **删除**                  | 否                      | 否（用 Bearer）             |
| 401 刷新      | 否                        | 可选                    | **单飞 refresh + 重试一次** |
| SSR 安全      | ✅                        | 看场景                  | ❌（仅 CSR 产品页）         |

### Public 客户端

用于新闻、定价等 **不经 token 的公开 SEO 数据**（是否 CDN 缓存由 `routeRules` 决定，如新闻 SWR、定价 SSR）：

```ts
// app/api/public.ts
export const fetchNewsArticles = (locale: SupportedLocale) =>
  createPublicApiClient({ locale }).request('/content/news', { method: 'GET' })
```

本地 FAQ 不走 HTTP：

```ts
export const getFaqItems = (locale) => faqItems.map(...)
```

### Auth 客户端

用于 login、register、refresh、logout、/me、profile：

```ts
// app/api/auth.ts
export const loginApi = (payload) => sendAuthApiRequest('/login', { method: 'POST', body: payload })
```

`createProductApiClient()` 也在 `auth.ts` 导出，内部组合 `createAuthApiClient` + `refreshAccessTokenOnce` 单飞 refresh（并发 401 共享同一 `refreshPromise`）。

`fetchMeApi` / `fetchProfileApi` / `updateProfileApi` 通过 `sendAuthApiRequest(..., { retryOnUnauthorized: true })` 启用 401 自动 refresh 重试。

### Product 客户端

工作台、编辑器 API 统一使用：

```ts
// app/api/workspace-project.ts
export const fetchWorkspaceProjects = () =>
  createProductApiClient().request('/projects', { method: 'GET' })
```

## 401 单飞刷新

```
请求失败 401
    ↓
refreshAccessTokenOnce()  ← 并发请求共享同一个 Promise
    ↓
POST /refresh { refreshToken }
    ↓
成功 → 写 cookie → 用新 token 重试原请求一次
失败（401）→ useAuthSession().clear() → 抛错
```

实现位置：`app/api/auth.ts` 的 `refreshAccessTokenOnce`。

## SWR 按需缓存失效

新闻页走 SWR 3600s。CMS/API 侧内容变更后，由后端 webhook 调用 Nuxt 服务端接口，不必等待 TTL：

```
nuxt-modern-starter-api（新闻发布/更新/删除）
        ↓
POST /api/revalidate
  Header: x-revalidate-secret: <NUXT_REVALIDATE_SECRET>
  Body: { "slug": "article-slug" } 或 { "paths": [...] }
        ↓
server/utils/revalidate.ts → purgeRouteCaches()
        ↓
清除 nitro/routes 缓存条目 → 下次请求重新 SSR
```

`slug` 快捷方式会展开为 **全部 `SUPPORTED_LOCALES`（15 种）的新闻列表 + 详情，共 30 条路径**
（`getNewsRevalidatePaths()`，见 `tests/unit/revalidate.test.ts` 的 `SUPPORTED_LOCALES.length * 2` 断言）。
未配置 `revalidateSecret`（`NUXT_REVALIDATE_SECRET`）时返回 503。

## API 端点地图

### 公开内容（`~/api/public`）

| 函数                        | 方法 | 路径                         |
| --------------------------- | ---- | ---------------------------- |
| `getFaqItems`               | —    | 本地 `config/content/faq.ts` |
| `fetchNewsArticles`         | GET  | `/content/news`              |
| `fetchLocalizedNewsArticle` | GET  | `/content/news/:slug`        |
| `fetchPricingPage`          | GET  | `/content/pricing`           |

### 鉴权（`~/api/auth`）

| 函数               | 方法  | 路径          |
| ------------------ | ----- | ------------- |
| `registerApi`      | POST  | `/register`   |
| `loginApi`         | POST  | `/login`      |
| `refreshApi`       | POST  | `/refresh`    |
| `logoutApi`        | POST  | `/logout`     |
| `fetchMeApi`       | GET   | `/me`         |
| `fetchProfileApi`  | GET   | `/me/profile` |
| `updateProfileApi` | PATCH | `/me/profile` |

### 工作台（`~/api/workspace-project`）

| 函数                     | 方法   | 路径            |
| ------------------------ | ------ | --------------- |
| `fetchWorkspaceProjects` | GET    | `/projects`     |
| `fetchWorkspaceProject`  | GET    | `/projects/:id` |
| `createWorkspaceProject` | POST   | `/projects`     |
| `updateWorkspaceProject` | PATCH  | `/projects/:id` |
| `deleteWorkspaceProject` | DELETE | `/projects/:id` |

`createWorkspaceProject` 返回 `{ project, document }`；`WORKSPACE_NEW_PROJECT_ID = 'new'` 用于 `/docs/new` 路由。

### 编辑器（`~/features/editor/api`）

| 函数                  | 方法  | 路径                     |
| --------------------- | ----- | ------------------------ |
| `fetchEditorDocument` | GET   | `/documents/:documentId` |
| `saveEditorDocument`  | PATCH | `/documents/:documentId` |

::: info
`NUXT_PUBLIC_API_BASE` 已含 `/api` 前缀，适配器里写 `/projects` 而非 `/api/projects`。
:::

## 错误处理约定

```ts
import { getApiErrorMessage } from '~/lib/http/error'

try {
  await loginApi(form)
} catch (error) {
  message.error(getApiErrorMessage(error, t('auth.login.failed')))
}
```

- 日志中 `authorization`、`cookie` 会被脱敏
- 公开适配器 **禁止** 读 token 或触发 refresh

## 下一步

- [鉴权设计](/architecture/auth)
- [添加 API 请求](/development/add-api)
