# 添加 SEO

## 基础用法

```ts
usePageSeo({
  path: '/my-page', // canonical 路径（无前缀）
  locale: languageStore.currentLanguage,
  title: t('myPage.title'),
  description: t('myPage.lead')
})
```

## 首页完整示例

```ts
const runtimeConfig = useRuntimeConfig()

usePageSeo({
  path: '/',
  locale: languageStore.currentLanguage,
  title: t('home.title'),
  description: t('home.lead'),
  webPage: true,
  includeOrganization: true,
  siteVerification: {
    google: runtimeConfig.public.googleSiteVerification || undefined,
    baidu: runtimeConfig.public.baiduSiteVerification || undefined
  }
})
```

## 新闻详情 Article

传入 `article` 时，`usePageSeo` 经 `buildPageSeoScripts` 输出 Article JSON-LD 并设置 `og:type=article`：

```ts
usePageSeo({
  path: `/news/${slug}`,
  locale: languageStore.currentLanguage,
  title: article.title,
  description: article.description,
  article: {
    title: article.title,
    description: article.description,
    publishedAt: article.publishedAt
  }
})
```

## 产品页 noindex

```ts
usePageSeo({
  path: '/workspace',
  locale: languageStore.currentLanguage,
  title: t('workspace.title'),
  description: t('workspace.lead'),
  noindex: true
})
```

noindex 页仍输出 canonical/OG/Twitter，但 **不输出 hreflang**。

## sitemap / robots

新增公开页后：

1. 加入 `PUBLIC_PAGE_PATHS`
2. sitemap 通过 `publicLocalizedPaths()` 自动包含
3. 新闻详情由 `server/utils/seo.ts` 从 API 拉 slug

新闻页若走 SWR，内容更新后由后端 webhook 调用 `POST /api/revalidate`（见 [SEO 设计 — SWR 按需缓存失效](/architecture/seo#swr-按需缓存失效)）。

无需手改 `sitemap.xml.ts`，除非有新 **内容类型** 的 URL 模式。

## 下一步

- [SEO 设计](/architecture/seo)
- [编码约定](/development/conventions)
