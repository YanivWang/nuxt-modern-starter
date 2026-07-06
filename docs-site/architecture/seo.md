# SEO 设计

## 核心 composable

`usePageSeo()` — 公开页与 noindex 页的统一 SEO 入口。

```ts
usePageSeo({
  path: '/help', // 无前缀 canonical 路径
  locale: languageStore.currentLanguage,
  title: t('help.title'),
  description: t('help.lead')
})
```

## 自动生成项

| 类型              | 公开页 | noindex 页（产品/登录） |
| ----------------- | ------ | ----------------------- |
| `<title>`         | ✅     | ✅                      |
| meta description  | ✅     | ✅                      |
| canonical         | ✅     | ✅                      |
| Open Graph        | ✅     | ✅                      |
| Twitter Card      | ✅     | ✅                      |
| hreflang 交替链接 | ✅     | ❌                      |
| JSON-LD           | 可选   | 通常不需要              |

默认 OG 图：`public/og-default.png`（`config/site.ts` → `DEFAULT_SEO.ogImage`）

## JSON-LD 可选参数

| 参数                                           | 效果                        |
| ---------------------------------------------- | --------------------------- |
| `webPage: true`                                | WebPage 结构化数据          |
| `includeOrganization: true`                    | Organization（首页示例）    |
| `article: { title, description, publishedAt }` | Article + `og:type=article` |
| `siteVerification: { google?, baidu? }`        | 搜索引擎验证 meta           |

## 服务端 SEO 路由

| 路由           | 文件                           | 内容                         |
| -------------- | ------------------------------ | ---------------------------- |
| `/sitemap.xml` | `server/routes/sitemap.xml.ts` | 公开页 + 新闻详情            |
| `/robots.txt`  | `server/routes/robots.txt.ts`  | Allow / + Disallow 产品/登录 |

生成逻辑：`server/utils/seo.ts` + `config/routes.ts` 的 `publicLocalizedPaths()`

**排除项**：`/workspace`、`/docs/`、`/account`、`/sign-in`、`/sign-up`

## 渲染与 SEO 的关系

| 渲染       | SEO 含义                        |
| ---------- | ------------------------------- |
| prerender  | 构建时 HTML 已含 meta，爬虫友好 |
| SWR        | 首屏 SSR HTML 含 meta，后台刷新 |
| CSR 产品页 | noindex，不参与 sitemap         |

## 搜索控制台验证

```bash
NUXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
NUXT_PUBLIC_BAIDU_SITE_VERIFICATION=
```

从 `runtimeConfig.public` 读取，传入 `usePageSeo({ siteVerification })`，不要硬编码在模板里。

## 新增公开页 SEO 清单

- [ ] `usePageSeo({ path, title, description })`
- [ ] 加入 `PUBLIC_PAGE_PATHS`（如需 sitemap/hreflang）
- [ ] 更新 prerender 或 SWR 规则（若需要）
- [ ] 补充 i18n 文案
- [ ] 运行 SEO 相关单测

## 下一步

- [添加 SEO](/development/add-seo)
- [部署概览](/deployment/overview)
