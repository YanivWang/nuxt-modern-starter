import {
  DEFAULT_LOCALE,
  SITE_LOCALE_PREFIX_MAP,
  SUPPORTED_LOCALES,
  type SupportedLocale
} from '../../config/site'
import { loadLocaleMessages, localeFromPrefix } from '../../i18n'

const DEFAULT_PREFIX = SITE_LOCALE_PREFIX_MAP[DEFAULT_LOCALE]

const hasTrailingSlash = (path: string) => path.length > 1 && path.endsWith('/')

const withoutTrailingSlash = (path: string) => path.replace(/\/+$/, '') || '/'

const isLocaleLikePrefix = (segment?: string) => Boolean(segment && /^[a-z]{2}$/i.test(segment))

export default defineNuxtRouteMiddleware(async (to) => {
  if (hasTrailingSlash(to.path)) {
    return navigateTo(
      {
        path: withoutTrailingSlash(to.path),
        query: to.query,
        hash: to.hash
      },
      { redirectCode: 301 }
    )
  }

  const firstSegment = to.path.split('/').filter(Boolean)[0]

  if (firstSegment === DEFAULT_PREFIX) {
    const segmentsWithoutDefaultPrefix = to.path.split('/').filter(Boolean).slice(1)
    const pathWithoutDefaultPrefix = segmentsWithoutDefaultPrefix.length
      ? `/${segmentsWithoutDefaultPrefix.join('/')}`
      : '/'

    return navigateTo(
      {
        path: pathWithoutDefaultPrefix,
        query: to.query,
        hash: to.hash
      },
      { redirectCode: 301 }
    )
  }

  const locale = firstSegment ? localeFromPrefix(firstSegment) : DEFAULT_LOCALE

  if (!locale && isLocaleLikePrefix(firstSegment)) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Unsupported language'
    })
  }

  const resolvedLocale = (locale || DEFAULT_LOCALE) as SupportedLocale

  if (!SUPPORTED_LOCALES.includes(resolvedLocale)) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Unsupported language'
    })
  }

  const languageStore = useLanguageStore()
  await languageStore.chooseLanguage(resolvedLocale)
  await loadLocaleMessages(resolvedLocale)
})
