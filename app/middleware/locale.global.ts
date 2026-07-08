/*
  【文件职责】
    全局路由中间件：每次导航前规范化 URL 并解析 UI locale。
    resolveLocaleRouteDecision 集中处理尾斜杠、默认语言前缀 /zh、本地化产品 URL 301、
    不支持语言前缀 404；通过后同步 languageStore 与 i18n 文案。

  【架构位置】
    共享层 — app/middleware，全局注册，在命名 auth 中间件之前执行。
    与 server/middleware/product-canonical.ts 构成双层产品 URL canonical（SSR 首请求 + 客户端导航）。

  【主要导出 / 路由】
    resolveLocaleRouteDecision、LocaleRouteDecision；作用于全部路由（公开 SEO 区 + 产品 CSR 区）。

  【依赖关系】
    - 依赖：config/site.ts、config/routes.ts（localizedProductPathToCanonical）、i18n（loadLocaleMessages、localeFromPrefix）
    - 被引用：Nuxt 全局 middleware 自动注册；tests/unit/locale-routing.test.ts 直接测决策函数

  【渲染 / 数据】
    全局 middleware，SSR 与 CSR 导航均执行；不拉 API，仅解析 path 并加载 i18n messages。

  【边界与注意】
    产品 URL 语言中性（/workspace、/docs/**、/account）；/en/workspace 等 301 到 canonical。
    /sign-in、/sign-up 不在 PUBLIC_PAGE_PATHS，但仍走 locale 解析（默认 zh-CN 或 /en 前缀）。
    不支持的语言前缀（如 /fr/*）返回 404（error.unsupportedLanguage）。
*/
import {
  DEFAULT_LOCALE,
  SITE_LOCALE_PREFIX_MAP,
  SUPPORTED_LOCALES,
  type SupportedLocale
} from '../../config/site'
import { localizedProductPathToCanonical } from '../../config/routes'
import { loadLocaleMessages, localeFromPrefix } from '../../i18n'

const DEFAULT_PREFIX = SITE_LOCALE_PREFIX_MAP[DEFAULT_LOCALE]

/** 非根路径且以 / 结尾时视为尾斜杠，需 301 规范化 */
const hasTrailingSlash = (path: string) => path.length > 1 && path.endsWith('/')

/** 去除末尾斜杠；全为斜杠时回退为 / */
const withoutTrailingSlash = (path: string) => path.replace(/\/+$/, '') || '/'

/** 两字母段（如 fr）但不在 SUPPORTED_LOCALES 时用于判定 unsupportedLanguage 404 */
const isLocaleLikePrefix = (segment?: string) => Boolean(segment && /^[a-z]{2}$/i.test(segment))

export type LocaleRouteDecision =
  | {
      type: 'redirect'
      path: string
      redirectCode: 301
    }
  | {
      type: 'error'
      statusCode: 404
      statusMessage: string
    }
  | {
      type: 'locale'
      locale: SupportedLocale
    }

/**
 * 纯函数决策树（按优先级）：
 * 1. 尾斜杠 301 → 2. /zh 前缀 301 → 3. 本地化产品 URL 301 → 4. 不支持语言 404 → 5. 解析 locale
 */
export const resolveLocaleRouteDecision = (path: string): LocaleRouteDecision => {
  // 尾斜杠统一 301 去除（根路径 / 除外）
  if (hasTrailingSlash(path)) {
    return {
      type: 'redirect',
      path: withoutTrailingSlash(path),
      redirectCode: 301
    }
  }

  const segments = path.split('/').filter(Boolean)
  const [firstSegment] = segments
  const productCanonicalPath = localizedProductPathToCanonical(path)

  // 默认语言（zh-CN）URL 不带前缀；/zh/* 301 到无前缀 canonical
  if (firstSegment === DEFAULT_PREFIX) {
    const segmentsWithoutDefaultPrefix = segments.slice(1)
    const pathWithoutDefaultPrefix = segmentsWithoutDefaultPrefix.length
      ? `/${segmentsWithoutDefaultPrefix.join('/')}`
      : '/'

    return {
      type: 'redirect',
      path: pathWithoutDefaultPrefix,
      redirectCode: 301
    }
  }

  // 产品区 URL 语言中性：/en/workspace → /workspace（与 server/middleware/product-canonical.ts 同规则）
  if (productCanonicalPath) {
    return {
      type: 'redirect',
      path: productCanonicalPath,
      redirectCode: 301
    }
  }

  const locale = firstSegment ? localeFromPrefix(firstSegment) : DEFAULT_LOCALE

  // 形如 /fr/pricing 的两字母前缀但不在 SUPPORTED_LOCALES → 404
  if (!locale && isLocaleLikePrefix(firstSegment)) {
    return {
      type: 'error',
      statusCode: 404,
      statusMessage: 'error.unsupportedLanguage'
    }
  }

  const resolvedLocale = (locale || DEFAULT_LOCALE) as SupportedLocale

  // 防御性校验：localeFromPrefix 正常只返回支持语言，此处兜底非法 locale 值
  if (!SUPPORTED_LOCALES.includes(resolvedLocale)) {
    return {
      type: 'error',
      statusCode: 404,
      statusMessage: 'error.unsupportedLanguage'
    }
  }

  return {
    type: 'locale',
    locale: resolvedLocale
  }
}

export default defineNuxtRouteMiddleware(async (to) => {
  const decision = resolveLocaleRouteDecision(to.path)

  if (decision.type === 'redirect') {
    // 301 时保留 query 与 hash，仅规范化 path
    return navigateTo(
      {
        path: decision.path,
        query: to.query,
        hash: to.hash
      },
      { redirectCode: decision.redirectCode }
    )
  }

  if (decision.type === 'error') {
    throw createError({
      statusCode: decision.statusCode,
      statusMessage: decision.statusMessage
    })
  }

  const languageStore = useLanguageStore()
  // chooseLanguage 已内含 loadLocaleMessages；再次调用为幂等，确保 i18n.global.locale 与 store 同步
  await languageStore.chooseLanguage(decision.locale)
  await loadLocaleMessages(decision.locale)
})
