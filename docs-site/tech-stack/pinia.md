# Pinia 状态管理

## 全局 Store

| Store      | 文件                     | 状态与职责                                                                      |
| ---------- | ------------------------ | ------------------------------------------------------------------------------- |
| `auth`     | `app/stores/auth.ts`     | user、status、login/logout/fetchMe                                              |
| `language` | `app/stores/language.ts` | currentLanguage、切换语言                                                       |
| `theme`    | `app/stores/theme.ts`    | `mode` 偏好与 `resolvedMode` 实际色板（DOM 与 AntD token 由 `useTheme()` 应用） |

## auth Store 状态机

```
idle → loading → authenticated
              ↘ unauthenticated
              ↘ refreshing（token 刷新中）
```

主要 action：

- `login(payload)` — loginApi → 存 token → fetchMe
- `register(payload)` — 仅注册，不登录
- `logout()` — 调 API + `clearAttributionParams()` + reset
- `refresh()` — refreshApi → 更新 token
- `fetchMe()` — 拉用户信息

`useAuth().ensureSession()` 恢复顺序：已认证 → 有 accessToken 则 fetchMe → 有 refreshToken 则 refresh + fetchMe → 否则 reset。

## 使用方式

推荐通过 composable 访问：

```ts
const { authStore, login, logout, ensureSession, can, hasRole } = useAuth()
```

middleware 中：

```ts
const { ensureSession, hasRole, can } = useAuth()
```

## Feature Store

feature 私有状态放 `app/features/<name>/stores/`，不要堆在顶层 `app/stores/`。

顶层 stores 只放 **跨 feature 的框架级状态**（auth、language、theme）。

## 与 Cookie 的关系

令牌**不在 Pinia 里**。`accessToken` / `refreshToken` 是 `app/utils/auth-session.ts` 持有的
`useCookie` ref，只能经 `useAuthSession()` 读写；auth store 仅通过 `isAuthenticated` 这类
computed 间接依赖它们。

原因：`@pinia/nuxt` 会在 `app:rendered` 把 store state 序列化进 `nuxtApp.payload.pinia`，
也就是写进 SSR HTML；而公开路由存在 prerender / SWR 缓存，那份 HTML 会被发给其他访客。
详见[鉴权设计 — 为什么会话状态不进 SSR](/architecture/auth#为什么会话状态不进-ssr)，
约束由 `tests/unit/ssr-cache-safety.test.ts` 守住。

## 下一步

- [鉴权设计](/architecture/auth)
- [Ant Design Vue](/tech-stack/ant-design-vue)
