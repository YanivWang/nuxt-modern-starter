# HTTP 请求层

## 文件职责

```
app/lib/http/
├── types.ts      # ApiResponse<T>、ApiClientOptions
├── headers.ts    # createHeaders、createBearerHeaders、sanitizeHeaders
├── error.ts      # assertApiSuccess、getApiErrorMessage、isUnauthorizedError
└── client.ts     # createApiClient
```

## createApiClient

核心能力：

1. 合并 baseURL + headers
2. 要求响应必须是 `{ code, message, data }` 标准信封并 `assertApiSuccess`
3. 401 时调用 `onUnauthorized` 获取新 headers 并重试 **一次**
4. 响应不符合标准信封时直接抛出契约错误

```ts
const client = createApiClient({
  baseURL: runtimeConfig.public.apiBase,
  headers: createBearerHeaders(token),
  onUnauthorized: refreshHandler
})

const response = await client.request<MeResponse>('/me')
```

## 场景客户端

定义在 `app/api/clients.ts`：

- **`createPublicApiClient`** — 删除 auth/cookie headers，设置 accept-language
- **`createAuthApiClient`** — Bearer + 可选 refresh 回调

`createProductApiClient` 在 `app/api/auth.ts`，自动绑定 cookie token 与单飞 refresh。

## 添加新请求的决策树

```
新接口属于哪个域？
├── 公开 SEO 内容 → app/api/public.ts + createPublicApiClient
├── 登录/用户 → app/api/auth.ts + createAuthApiClient
└── 某 feature 私有 → app/features/<name>/api.ts + createProductApiClient
```

**禁止**：

- 页面里直接 `$fetch('https://...')`
- 做一个「万能 useApi composable」

## 测试

参考 `tests/unit/lib-http.test.ts`、`tests/unit/api-clients.test.ts`。

## 下一步

- [请求与数据流](/architecture/data-flow)
- [添加 API 请求](/development/add-api)
