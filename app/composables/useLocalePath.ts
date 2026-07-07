/*
  【文件职责】
    多语言路径 composable：localePath 为公开页加 /en 前缀，产品 path 保持语言中性。
    switchLocalePath 生成语言切换目标 URL（保留 query / hash）。

  【架构位置】
    共享层 — app/composables，被 AppHeader、公开页链接、useLanguageSwitch 消费。

  【主要导出 / 路由】
    useLocalePath — localePath、switchLocalePath

  【依赖关系】
    - 依赖：config/site.ts、config/routes.ts（isProductPath）、i18n（getSwitchLanguageUrl）
    - 被引用：AppHeader、公开页 CTA、useLanguageSwitch

  【渲染 / 数据】
    无 — 纯 path 计算；内部链接应使用 localePath 而非硬编码 /en。

  【边界与注意】
    产品 URL（/workspace、/docs/**、/account）localePath 不加语言前缀。
    修改规则需同步 tests/unit/locale-path.test.ts。
*/
import { DEFAULT_LOCALE, SITE_LOCALE_PREFIX_MAP, type SupportedLocale } from '../../config/site'
import { isProductPath } from '../../config/routes'
import { getSwitchLanguageUrl, relativeLangPath } from '../../i18n'

const withQueryAndHash = (path: string, query?: string, hash?: string) => {
  const normalizedQuery = query ? `?${query.replace(/^\?/, '')}` : ''
  const normalizedHash = hash ? `#${hash.replace(/^#/, '')}` : ''

  return `${path}${normalizedQuery}${normalizedHash}`
}

export const useLocalePath = () => {
  const route = useRoute()
  const languageStore = useLanguageStore()

  const localePath = (path: string, locale = languageStore.currentLanguage) => {
    const relativePath = relativeLangPath(path)

    if (isProductPath(relativePath)) {
      return relativePath
    }

    if (locale === DEFAULT_LOCALE) {
      return relativePath
    }

    const prefix = SITE_LOCALE_PREFIX_MAP[locale]
    return `/${prefix}${relativePath === '/' ? '' : relativePath}`
  }

  const switchLocalePath = (targetLocale: SupportedLocale) => {
    const query = new URLSearchParams(route.query as Record<string, string>).toString()
    return getSwitchLanguageUrl(route.path, targetLocale, withQueryAndHash('', query, route.hash))
  }

  return {
    localePath,
    switchLocalePath
  }
}
