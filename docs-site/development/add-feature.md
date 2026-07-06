# 添加功能模块

登录后产品功能的标准接入方式。

## 何时创建 Feature

- UI 超过一个简单组件
- 有私有 API、类型、状态
- 可能被多个页面复用

简单静态块可放 `app/components/`，不必强行 feature。

## 标准目录结构

```
app/features/billing/
├── components/
│   └── BillingDashboard.vue
├── api.ts                 # 可选
├── types.ts               # 可选
├── composables/           # 可选
├── stores/                # 可选
└── index.ts               # 必须：对外导出面
```

`index.ts` 示例：

```ts
export { default as BillingDashboard } from './components/BillingDashboard.vue'
export * from './api'
```

## 创建页面入口

### 产品壳页面（带侧边栏）

```vue
<!-- app/pages/workspace/billing/index.vue -->
<script setup lang="ts">
import { BillingDashboard } from '~/features/billing'

definePageMeta({
  layout: 'product',
  middleware: 'auth'
})

usePageSeo({
  path: '/workspace/billing',
  noindex: true,
  title: 'Billing',
  description: 'Billing'
})
</script>

<template>
  <BillingDashboard />
</template>
```

### 更新侧边栏

`app/features/product-shell/config.ts`：

```ts
export const productNavItems = [
  // ...
  { path: '/workspace/billing', labelKey: 'productNav.billing', icon: 'CreditCardOutlined' }
]
```

### 更新 CSR 规则

若路径在 `/workspace/**` 下，**已自动 CSR**。若是新的 top-level 产品路径（如 `/billing`），需更新 `config/routes.ts`：

```ts
export const productRoutePatterns = [
  '/workspace/**',
  '/docs/**',
  '/account',
  '/billing' // 新增
] as const
```

并同步 `isProductPath()` 逻辑。

## 跨 Feature 引用

✅ 正确：

```ts
import { getWorkspaceDocPath } from '~/features/workspace'
```

❌ 错误：

```ts
import { getWorkspaceDocPath } from '~/features/workspace/api'
import Something from '~/features/workspace/components/WorkspaceDashboard.vue'
```

## 完整示例：现有模块参考

| 需求类型    | 参考模块                     | 要点                                                           |
| ----------- | ---------------------------- | -------------------------------------------------------------- |
| 列表 + CRUD | `workspace`                  | 创建跳转 `/docs/new`；删除带 confirm；idle 预加载 editor chunk |
| 全屏编辑器  | `editor` + `pages/docs/[id]` | 草稿首次保存创建项目；`cachedProject` 防闪烁；路由离开 flush   |
| 占位页      | `templates`                  | 6 张虚线卡片 + `a-empty`，无 API                               |
| 设置页      | `account` + `account-shell`  | `fetchProfileApi` + `useUserAvatar`                            |
| 侧边栏壳    | `product-shell`              | `productNavItems` + footer 定价链接                            |

## 下一步

- [添加 API 请求](/development/add-api)
- [目录结构](/architecture/directory)
