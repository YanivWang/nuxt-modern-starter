/*
  【文件职责】
    account-shell feature 对外导出面：AccountShell layout 组件。

  【架构位置】
    登录产品区 — app/features/account-shell barrel。

  【主要导出 / 路由】
    AccountShell

  【依赖关系】
    - 依赖：./components/AccountShell.vue
    - 被引用：app/layouts/account.vue

  【渲染 / 数据】
    无 — 纯 re-export。

  【边界与注意】
    与 product-shell 分离；账户侧栏 config 在 ./config.ts。
*/
// layouts/account.vue 唯一消费方
export { default as AccountShell } from './components/AccountShell.vue'
