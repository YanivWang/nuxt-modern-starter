<!--
  【文件职责】
    公开 SEO 区默认 layout shell：AppHeader + main + AppFooter 纵向布局。
    包裹 [[language]] 下首页、定价、关于、帮助、新闻、登录注册等公开页。

  【架构位置】
    公开 SEO 区 — app/layouts，definePageMeta 未指定 layout 时的默认值。

  【主要导出 / 路由】
    default layout；用于 /、/pricing、/about、/help、/news、/sign-in 等

  【依赖关系】
    - 依赖：AppHeader、AppFooter（auto-import，pathPrefix: false）
    - 被引用：app/pages/[[language]]/* 公开页

  【渲染 / 数据】
    SSR / prerender / SWR 公开页；header 含 NAV_ITEMS 主导航与 auth CTA。

  【边界与注意】
    产品区使用 product / account / editor layout，不用 default。
-->
<template>
  <!-- 公开 SEO 区默认壳：AppHeader + main + AppFooter -->
  <div class="app-shell">
    <AppHeader />
    <main class="app-main">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
