/*
  【文件职责】
    product-shell feature 对外导出面：ProductShell 组件与导航 config 常量。
    消费方须从 ~/features/product-shell barrel 导入，勿深引内部路径。

  【架构位置】
    登录产品区 — app/features/product-shell barrel。

  【主要导出 / 路由】
    ProductShell、productNavItems、productFooterNavItems、ProductNavItem

  【依赖关系】
    - 依赖：./components/ProductShell.vue、./config.ts
    - 被引用：app/layouts/product.vue、tests/unit/product-shell.test.ts

  【渲染 / 数据】
    无 — 纯 re-export。

  【边界与注意】
    新增产品侧栏入口改 config.ts，并同步 navIconMap（ProductShell.vue）。
*/
export { default as ProductShell } from './components/ProductShell.vue'
export { productFooterNavItems, productNavItems } from './config'
export type { ProductNavItem } from './config'
