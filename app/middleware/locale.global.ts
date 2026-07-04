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

export const resolveLocaleRouteDecision = (path: string): LocaleRouteDecision => {
  if (hasTrailingSlash(path)) {
    return {
      type: 'redirect',
      path: withoutTrailingSlash(path),
      redirectCode: 301
    }
  }

  const firstSegment = path.split('/').filter(Boolean)[0]

  if (firstSegment === DEFAULT_PREFIX) {
    const segmentsWithoutDefaultPrefix = path.split('/').filter(Boolean).slice(1)
    const pathWithoutDefaultPrefix = segmentsWithoutDefaultPrefix.length
      ? `/${segmentsWithoutDefaultPrefix.join('/')}`
      : '/'

    return {
      type: 'redirect',
      path: pathWithoutDefaultPrefix,
      redirectCode: 301
    }
  }

  const locale = firstSegment ? localeFromPrefix(firstSegment) : DEFAULT_LOCALE

  if (!locale && isLocaleLikePrefix(firstSegment)) {
    return {
      type: 'error',
      statusCode: 404,
      statusMessage: 'Unsupported language'
    }
  }

  const resolvedLocale = (locale || DEFAULT_LOCALE) as SupportedLocale

  if (!SUPPORTED_LOCALES.includes(resolvedLocale)) {
    return {
      type: 'error',
      statusCode: 404,
      statusMessage: 'Unsupported language'
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
  await languageStore.chooseLanguage(decision.locale)
  await loadLocaleMessages(decision.locale)
})
