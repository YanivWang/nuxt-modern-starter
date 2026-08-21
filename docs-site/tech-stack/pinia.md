# Pinia 状态管理

## 全局 Store

| Store      | 文件                     | 状态与职责                         |
| ---------- | ------------------------ | ---------------------------------- |
| `auth`     | `app/stores/auth.ts`     | user、status、login/logout/fetchMe |
| `language` | `app/stores/language.ts` | currentLanguage、切换语言          |
| `theme`    | `app/stores/theme.ts`    | light/dark、Ant Design theme token |

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

token 存在 Nuxt `useCookie` 中（`auth-session.ts`），Pinia 的 `accessToken`/`refreshToken` ref 与 cookie 双向绑定。

## 下一步

- [鉴权设计](/architecture/auth)
- [Ant Design Vue](/tech-stack/ant-design-vue)
