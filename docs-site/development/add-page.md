# 添加公开页面

面向 SEO 的营销/内容页，走 SSR 或 prerender/SWR。

## 步骤

### 1. 创建页面文件

```bash
app/pages/[[language]]/my-page.vue
```

```vue
<script setup lang="ts">
const languageStore = useLanguageStore()
const { t } = useI18n()
const { localePath } = useLocalePath()

usePageSeo({
  path: '/my-page',
  locale: languageStore.currentLanguage,
  title: t('myPage.title'),
  description: t('myPage.lead')
})
</script>

<template>
  <PageContainer>
    <h1>{{ t('myPage.title') }}</h1>
  </PageContainer>
</template>
```

访问路径：`/my-page`（默认中文）、`/<locale-prefix>/my-page`（非默认语言）。

### 2. 注册公开路径

`config/site.ts`：

```ts
export const PUBLIC_PAGE_PATHS = ['/', '/pricing', '/about', '/help', '/news', '/my-page']
export const NAV_ITEMS = [
  // ...
  { labelKey: 'nav.myPage', path: '/my-page' }
]
```

### 3. 配置渲染策略（可选）

`config/routes.ts`：

两条规则都由「基础路径 × 语言」展开，所以只需要往对应的基础路径数组里加一项：

```ts
// 静态化：会为 PRERENDER_LOCALES（zh-CN、en-US）各生成一条
export const PRERENDER_BASE_PATHS = ['/', '/about', '/help', '/my-page'] as const

// 或 SWR：会为全部 15 种语言各生成「裸路径 + 子树」两条
export const SWR_BASE_PATHS = ['/news', '/my-page'] as const
```

不要直接改 `prerenderRoutes` / `swrRouteRules` —— 它们是上面两个数组的派生结果。
改完同步 `tests/unit/seo-routes.test.ts`。

### 4. 补充 i18n

在每个 `i18n/<locale>/modules/marketing.json` 中添加 `myPage.*` 键，并确认对应 `index.ts` 已聚合该模块。

### 5. 样式与布局

- 使用 `<PageContainer>` 统一内容区宽度；长文页可设 `layout="prose"`。
- 复用 `patterns/_page.scss` 中的 `.page-panel`、`.page-surface-card` 等模式类，或 `main.scss` 中的 `.page-title` / `.page-lead`。
- 颜色、背景、边框使用 `var(--app-*)` token，不要硬编码品牌色。详见 [样式体系](/tech-stack/styles)。

### 6. 内部链接

```vue
<NuxtLink :to="localePath('/my-page')">...</NuxtLink>
```

永远用 `localePath()`，不要手写 `/en` 前缀。

## 需要后端数据时

在 `app/api/public.ts` 添加适配器：

```ts
export const fetchMyPageContent = (locale: SupportedLocale) =>
  createPublicApiClient({ locale }).request('/content/my-page', { method: 'GET' })
```

页面中：

```ts
const { data } = await useAsyncData('my-page', () =>
  fetchMyPageContent(languageStore.currentLanguage)
)
```

## 检查清单

- [ ] 文件在 `app/pages/[[language]]/`
- [ ] `usePageSeo` 已调用
- [ ] `PUBLIC_PAGE_PATHS` 已更新（若需 sitemap）
- [ ] prerender/SWR 已配置（若需要）
- [ ] i18n 中英文已补
- [ ] 内部链接用 `localePath()`
- [ ] 样式使用 `--app-*` token 或 patterns 模式类（无硬编码品牌色）
- [ ] 补充 locale/SEO 单测

## 下一步

- [添加功能模块](/development/add-feature)
- [添加 SEO](/development/add-seo)
