# i18n 链路重构记录

> 记录日期：2026-07-08  
> 参考来源：`aippt-home` 多语言实现；当前项目已按 starter 边界重构，不再照搬业务站脚本与页面级 SEO 写法。

## 当前结论

当前多语言链路可以作为 `nuxt-modern-starter` 的正式 starter 能力使用：

- 运行时使用自建 `vue-i18n` 链路，不引入 `@nuxtjs/i18n`。
- `config/site.ts` 是 locale 元数据单一来源，包含 `SUPPORTED_LOCALES`、URL prefix、hreflang、语言选择器 label/id。
- `i18n/index.ts` 只负责 i18n 实例、语言包 resolver、URL prefix 解析与语言切换 URL 生成。
- 公开 SEO 页按 locale prefix 生成 URL；产品页保持 `/workspace`、`/docs/:id`、`/account` 等语言中性 URL。
- `usePageSeo`、`server/utils/seo.ts` 基于 `SUPPORTED_LOCALES` 生成 hreflang、sitemap、robots 相关输出。
- `pnpm i18n:check` 已纳入 `pnpm quality`，用于防止 locale 配置、目录、resolver、模块导入、翻译 key 与 diff 快照漂移。

## 与 aippt-home 的保留差异

| 维度          | `aippt-home`           | 当前 starter              |
| ------------- | ---------------------- | ------------------------- |
| 默认语言      | `en-US`                | `zh-CN`                   |
| 语言持久化    | `localStorage`         | cookie，SSR 友好          |
| SEO alternate | 页面内大量手写         | `usePageSeo` 统一生成     |
| 语言配置      | 分散在 i18n 与脚本常量 | `config/site.ts` 单一来源 |
| 产品页 URL    | 业务项目混合场景       | 明确语言中性              |

## 治理命令

| 命令               | 作用                                                                 |
| ------------------ | -------------------------------------------------------------------- |
| `pnpm i18n:check`  | 校验 locale 目录、配置、resolver、模块导入、缺失翻译与 diff 快照同步 |
| `pnpm i18n:diff`   | 生成全量 key 快照 `scripts/i18n-diff.json`                           |
| `pnpm i18n:scan`   | 生成实际引用 key 快照 `scripts/i18n-used.json`                       |
| `pnpm i18n:unused` | 生成未引用 key 快照 `scripts/i18n-unused.json`                       |

当前快照：15 个 locale、144 个 i18n key、0 个 unused key。

## 后续维护规则

- 新增 locale 必须同时更新 `SUPPORTED_LOCALES`、`SITE_LOCALE_PREFIX_MAP`、`SITE_HREFLANG_MAP`、`SITE_LOCALE_OPTIONS`、`LOCALE_MESSAGE_RESOLVERS` 和对应 `i18n/<locale>/modules/*.json`。
- 删除 locale 时不得保留任何配置残留；`i18n:check` 会拦截多余的 prefix、hreflang、options、resolver 或目录。
- 新增公开页时更新 `PUBLIC_PAGE_PATHS`，并用 `usePageSeo({ path })` 输出 canonical / hreflang。
- 新增产品页时保持语言中性 URL，不添加 `/en/workspace` 一类路径。
- 不保留“未来可能用”的 i18n key；未被引用的文案应删除，等真实功能落地时再补。
