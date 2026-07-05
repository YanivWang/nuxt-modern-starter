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
