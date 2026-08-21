# 添加 API 请求

## 决策流程

```mermaid
flowchart TD
    A[新接口] --> B{公开 SEO 数据?}
    B -->|是| C[app/api/public.ts]
    B -->|否| D{鉴权端点?}
    D -->|是| E[app/api/auth.ts]
    D -->|否| F[app/features/xxx/api.ts]
    C --> G[createPublicApiClient]
    E --> H[createAuthApiClient 或 sendAuthApiRequest]
    F --> I[createProductApiClient]
```

## `useAsyncData` 的边界

`useAsyncData` 是**页面数据**的工具，不是请求工具。它按 key 缓存，命中时直接返回上次的值、
**不会重新调用 handler**。放进事件回调里，用户看到的是旧数据，而且请求根本没发出去。

| 场景                             | 写法                                      |
| -------------------------------- | ----------------------------------------- |
| 页面数据（需 SSR + hydration）   | `useAsyncData(() => key, () => xxxApi())` |
| 事件里的读写（点击、搜索、提交） | `await xxxApi()`                          |

key 必须包含请求依赖的全部输入（slug、locale、id）。优先用函数形式的 key 以便响应式重算，
并在这些输入可能不随路由变化时配合 `watch`。

## 示例：Feature 私有 API

`app/features/exports/api.ts`：

```ts
import type { ApiResponse } from '~/lib/http/types'
import { createProductApiClient } from '~/api/auth'

export type ExportTask = { id: string; status: 'queued' | 'running' | 'done' | 'failed' }

export const fetchExportTasks = () =>
  createProductApiClient().request<ApiResponse<{ tasks: ExportTask[] }>>('/exports', {
    method: 'GET'
  })
```

`app/features/exports/index.ts`：

```ts
export * from './api'
export { default as ExportTasksPanel } from './components/ExportTasksPanel.vue'
```

组件中使用：

```ts
import { fetchExportTasks } from '~/features/exports'

const { data, error, refresh } = await useAsyncData('export-tasks', () => fetchExportTasks())
```

## 示例：公开内容 API

`app/api/public.ts`：

```ts
export const fetchCaseStudies = (locale: SupportedLocale) =>
  createPublicApiClient({ locale }).request('/content/cases', { method: 'GET' })
```

## 错误处理

```ts
import { getApiErrorMessage } from '~/lib/http/error'

try {
  await fetchExportTasks()
} catch (error) {
  message.error(getApiErrorMessage(error, t('common.loadFailed')))
}
```

产品页推荐 pattern：`a-alert` + 重试按钮（参考 `WorkspaceDashboard`、`AccountPage`）。

## 路径约定

- `NUXT_PUBLIC_API_BASE` = `http://localhost:2027/api`
- 适配器内 path = `/projects`（**不要**重复 `/api`）

## 测试

为新适配器添加 `tests/unit/<feature>-api.test.ts`，mock `createProductApiClient` 或 `createPublicApiClient`。

参考：`tests/unit/workspace-api.test.ts`

## 禁止事项

- 页面内 `$fetch(runtimeConfig.public.apiBase + '/xxx')`
- 公开 adapter 读 token cookie
- 通用 `useRequest()` 封装

## 下一步

- [请求与数据流](/architecture/data-flow)
- [鉴权设计](/architecture/auth)
