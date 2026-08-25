/*
  【文件职责】
    页面 SEO composable：canonical、hreflang、OG / Twitter meta、JSON-LD（Article / WebPage / Organization）。
    buildPageSeoLinks 在 noindex 时仅输出 canonical，不生成 alternate hreflang。

  【架构位置】
    公开 SEO 区 — app/composables，被 [[language]] 公开页与产品页 noindex 场景消费。

  【主要导出 / 路由】
    usePageSeo、buildPageSeoLinks、buildPageSeoMeta、buildPageSeoScripts、buildHtmlLang

  【依赖关系】
    - 依赖：config/site.ts、config/routes.ts（localizedPath）、Nuxt app i18n context、useLanguageStore
    - 被引用：pricing、news、home 等公开页；workspace / account 等 noindex 页

  【渲染 / 数据】
    SSR / prerender / SWR 公开页完整 SEO；产品页 usePageSeo({ noindex: true })。

  【边界与注意】
    og:title 与 twitter:title 共用 resolved title（含站点名后缀）。
    修改 hreflang 逻辑需同步 tests/unit/page-seo.test.ts。
*/
import {
  DEFAULT_LOCALE,
  DEFAULT_SEO,
  SITE_HREFLANG_MAP,
  SITE_NAME,
  SITE_ORG,
  SUPPORTED_LOCALES,
  type SupportedLocale
} from '../../config/site'
import { localizedPath } from '../../config/routes'

/**
 * usePageSeo({ ... }) 页面入参。
 *
 * @example 公开页
 * usePageSeo({ path: '/pricing', title: t('pricing.title'), locale: languageStore.currentLanguage })
 *
 * @example 新闻详情（Article JSON-LD + og:type=article）
 * usePageSeo({ path: `/news/${slug}`, article: { title, description, publishedAt } })
 *
 * @example 产品区 / 鉴权页（noindex，无 hreflang）
 * usePageSeo({ path: '/workspace', title: t('workspace.title'), noindex: true })
 */
type PageSeoInput = {
  /** 页面标题（不含站点名）；传入后 resolved 为「title · SITE_NAME」，未传则用 DEFAULT_SEO.title */
  title?: string
  /** 页面描述；未传时依次回退 i18n seo.defaultDescription → DEFAULT_SEO.description */
  description?: string
  /**
   * canonical 路径（无前缀）。
   * 公开页如 '/pricing'；动态页如 `/news/${slug}`；404 可用 useRoute().path。
   * 多语言前缀由 localizedPath() 按 locale 追加，产品 path 保持语言中性。
   */
  path: string
  /** 当前页面 locale；未传时取 languageStore.currentLanguage，再回退 DEFAULT_LOCALE（zh-CN） */
  locale?: SupportedLocale
  /** OG / Twitter 分享图相对路径；未传用 DEFAULT_SEO.ogImage（/og-default.png），运行时拼为绝对 URL */
  ogImage?: string
  /**
   * 是否禁止索引。
   * true 时输出 robots noindex,nofollow，且不生成 hreflang alternate（产品区、sign-in、404 等）。
   */
  noindex?: boolean
  /**
   * 新闻详情等文章页结构化数据。
   * 传入后：og:type=article，并输出 Article JSON-LD（headline/description/datePublished/mainEntityOfPage）。
   * 字段值通常与页面 title/description 一致，但 JSON-LD 使用 article 原始值（不含「· 站点名」后缀）。
   */
  article?: {
    /** Article JSON-LD headline；新闻标题原文 */
    title: string
    /** Article JSON-LD description；新闻摘要原文 */
    description: string
    /** Article JSON-LD datePublished；ISO 8601 发布时间字符串 */
    publishedAt: string
  }
  /** true 时输出 WebPage JSON-LD（首页等营销页可选） */
  webPage?: boolean
  /** true 时输出 Organization JSON-LD（品牌名/首页 URL/logo 来自 config/site.ts SITE_ORG） */
  includeOrganization?: boolean
  /**
   * 搜索引擎站点验证 token；应从 runtimeConfig.public 读取，勿硬编码。
   * 空字符串 / 仅空白视为未配置，不输出对应 meta。
   */
  siteVerification?: { baidu?: string; google?: string }
}

/** buildPageSeoLinks 入参：由 usePageSeo 传入已解析的 siteUrl / locale / noindex */
type PageSeoLinkInput = Pick<PageSeoInput, 'path' | 'locale' | 'noindex'> & {
  /** 站点根 URL，来自 runtimeConfig.public.siteUrl；用于拼接 canonical / hreflang 绝对地址 */
  siteUrl: string
}

/**
 * buildPageSeoMeta 入参。
 * title / description / canonical / ogImage 均为 usePageSeo 解析后的最终值（非页面原始入参）。
 */
type PageSeoMetaInput = {
  siteUrl: string
  /** 写入 og:site_name，当前为 SITE_NAME */
  siteName: string
  /** 已 resolved 的 document title，同时用于 og:title 与 twitter:title */
  title: string
  /** 已 resolved 的 description，同时用于 meta description、og:description、twitter:description */
  description: string
  /** 当前 locale 下的 canonical 绝对 URL，同时写入 og:url */
  canonical: string
  /** 已转为绝对 URL 的分享图，同时写入 og:image 与 twitter:image */
  ogImage: string
  /** 写入 og:locale（如 zh-CN、en-US） */
  locale: SupportedLocale
  noindex?: boolean
  article?: PageSeoInput['article']
  siteVerification?: PageSeoInput['siteVerification']
}

/** buildPageSeoScripts 入参；article / webPage / includeOrganization 可任意组合，互不排斥 */
type PageSeoScriptsInput = {
  siteUrl: string
  /** Article.mainEntityOfPage、WebPage.url 等字段使用的 canonical 绝对 URL */
  canonical: string
  /** WebPage JSON-LD 的 name；未传 webPage 时可省略 */
  title?: string
  /** WebPage JSON-LD 的 description；未传 webPage 时可省略 */
  description?: string
  article?: PageSeoInput['article']
  webPage?: boolean
  includeOrganization?: boolean
}

/**
 * 拼接绝对 URL。
 * - siteUrl 去掉末尾 /，避免 https://example.com//pricing
 * - path 为 / 时不追加字符，得到 https://example.com
 */
const absoluteUrl = (siteUrl: string, path: string) =>
  `${siteUrl.replace(/\/$/, '')}${path === '/' ? '' : path}`

/**
 * 按点分 key 从 i18n 文案树取值（如 seo.defaultDescription）。
 * 中间节点非 object 或叶子非 string 时返回 undefined，触发下一级 fallback。
 */
const getLocaleMessage = (locale: SupportedLocale, key: string) => {
  const { $i18nContext } = useNuxtApp()
  const value = key.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object' && part in acc) {
      return (acc as Record<string, unknown>)[part]
    }

    return undefined
  }, $i18nContext.i18n.global.getLocaleMessage(locale))

  return typeof value === 'string' ? value : undefined
}

/** HTML lang 使用 BCP 47 语言值；与 hreflang 保持同一份配置来源 */
export const buildHtmlLang = (locale: SupportedLocale) => SITE_HREFLANG_MAP[locale]

/** 生成 canonical 与 hreflang link；公开页输出完整 alternate，noindex 页仅 canonical */
export const buildPageSeoLinks = (input: PageSeoLinkInput) => {
  const locale = input.locale || DEFAULT_LOCALE
  // canonical 对应当前 locale 的本地化 path（zh-CN 无前缀，en-US 为 /en/...，产品 path 不加前缀）
  const canonical = absoluteUrl(input.siteUrl, localizedPath(input.path, locale))
  const canonicalLink = { rel: 'canonical', href: canonical }

  // noindex 页（产品区、404、sign-in 等）不输出 hreflang，避免搜索引擎索引多语言变体
  if (input.noindex) {
    return [canonicalLink]
  }

  return [
    canonicalLink,
    // 为 SUPPORTED_LOCALES 各生成一条 alternate hreflang
    ...SUPPORTED_LOCALES.map((targetLocale) => ({
      rel: 'alternate',
      hreflang: SITE_HREFLANG_MAP[targetLocale],
      href: absoluteUrl(input.siteUrl, localizedPath(input.path, targetLocale))
    })),
    // x-default 指向默认语言 canonical（zh-CN 无前缀 path）
    {
      rel: 'alternate',
      hreflang: 'x-default',
      href: absoluteUrl(input.siteUrl, localizedPath(input.path, DEFAULT_LOCALE))
    }
  ]
}

/** 生成 description、Open Graph、Twitter Card 与可选站点验证 meta */
export const buildPageSeoMeta = (input: PageSeoMetaInput) => {
  // 有 article 入参时为 article，否则 website（影响社交平台预览类型，非 HTTP Content-Type）
  const ogType = input.article ? 'article' : 'website'

  const meta: Array<Record<string, string>> = [
    { name: 'description', content: input.description },
    { property: 'og:title', content: input.title },
    { property: 'og:description', content: input.description },
    { property: 'og:image', content: input.ogImage },
    { property: 'og:url', content: input.canonical },
    { property: 'og:locale', content: input.locale },
    { property: 'og:type', content: ogType },
    { property: 'og:site_name', content: input.siteName },
    // 固定大图卡片；title/description/image 与 OG 字段一一对应
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: input.title },
    { name: 'twitter:description', content: input.description },
    { name: 'twitter:image', content: input.ogImage },
    // noindex 时同时 nofollow，阻止爬虫跟踪页面内链接
    ...(input.noindex ? [{ name: 'robots', content: 'noindex,nofollow' }] : [])
  ]

  // 站点验证 token 来自 runtimeConfig.public，trim 后为空则不输出
  const googleToken = input.siteVerification?.google?.trim()
  if (googleToken) {
    meta.push({ name: 'google-site-verification', content: googleToken })
  }

  const baiduToken = input.siteVerification?.baidu?.trim()
  if (baiduToken) {
    meta.push({ name: 'baidu-site-verification', content: baiduToken })
  }

  return meta
}

/** 按页面类型输出 JSON-LD script；无 opt-in 时返回空数组 */
export const buildPageSeoScripts = (input: PageSeoScriptsInput) => {
  const scripts: Array<{ type: string; innerHTML: string }> = []

  if (input.article) {
    scripts.push({
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: input.article.title,
        description: input.article.description,
        datePublished: input.article.publishedAt,
        mainEntityOfPage: input.canonical
      })
    })
  }

  if (input.webPage) {
    scripts.push({
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: input.title,
        description: input.description,
        url: input.canonical
      })
    })
  }

  if (input.includeOrganization) {
    scripts.push({
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SITE_ORG.name,
        url: absoluteUrl(input.siteUrl, '/'),
        logo: absoluteUrl(input.siteUrl, SITE_ORG.logo)
      })
    })
  }

  return scripts
}

/**
 * 页面 SEO 统一入口：解析字段后通过 useHead 注入 title / meta / link / script。
 *
 * @returns 已 resolved 的 title、description、canonical，供模板或逻辑复用
 */
export const usePageSeo = (input: PageSeoInput) => {
  const runtimeConfig = useRuntimeConfig()

  // locale 优先级：页面入参 → languageStore → DEFAULT_LOCALE
  const locale = input.locale || useLanguageStore().currentLanguage || DEFAULT_LOCALE

  // 自定义 title 追加「· SITE_NAME」；未传 title 时直接用 DEFAULT_SEO.title（已含站点名，不再拼接）
  const title = input.title ? `${input.title} · ${SITE_NAME}` : DEFAULT_SEO.title

  // description 优先级：页面入参 → i18n seo.defaultDescription → DEFAULT_SEO.description
  const description =
    input.description ||
    getLocaleMessage(locale, 'seo.defaultDescription') ||
    DEFAULT_SEO.description

  // siteUrl 来自 NUXT_PUBLIC_SITE_URL；本地开发 fallback localhost:3000
  const siteUrl = runtimeConfig.public.siteUrl || 'http://localhost:3000'

  // path 经 localizedPath 加语言前缀后，再拼为 canonical 绝对 URL
  const canonicalPath = localizedPath(input.path, locale)
  const canonical = absoluteUrl(siteUrl, canonicalPath)

  // ogImage 相对路径转绝对 URL，供 OG / Twitter 分享图使用
  const ogImage = absoluteUrl(siteUrl, input.ogImage || DEFAULT_SEO.ogImage)

  useHead({
    title,
    htmlAttrs: {
      lang: buildHtmlLang(locale)
    },
    meta: buildPageSeoMeta({
      siteUrl,
      siteName: SITE_NAME,
      title,
      description,
      canonical,
      ogImage,
      locale,
      noindex: input.noindex,
      article: input.article,
      siteVerification: input.siteVerification
    }),
    link: buildPageSeoLinks({ siteUrl, path: input.path, locale, noindex: input.noindex }),
    script: buildPageSeoScripts({
      siteUrl,
      canonical,
      title,
      description,
      article: input.article,
      webPage: input.webPage,
      includeOrganization: input.includeOrganization
    })
  })

  return {
    title,
    description,
    canonical
  }
}
