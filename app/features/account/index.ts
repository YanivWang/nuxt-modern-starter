/*
  【文件职责】
    account feature 对外导出面：AccountPage 账户设置 UI。

  【架构位置】
    登录产品区 — app/features/account barrel。

  【主要导出 / 路由】
    AccountPage

  【依赖关系】
    - 依赖：./components/AccountPage.vue
    - 被引用：app/pages/account.vue

  【渲染 / 数据】
    无 — 纯 re-export。

  【边界与注意】
    退出逻辑在 AccountPage handleLogout，非 auth store。
*/
// pages/account.vue 挂载；logout 跳转在 AccountPage 内
export { default as AccountPage } from './components/AccountPage.vue'
