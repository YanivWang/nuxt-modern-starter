import type { SupportedLocale } from '../../config/site'

export const formatPublishedDate = (isoDate: string, locale: SupportedLocale) =>
  new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'
  }).format(new Date(`${isoDate}T00:00:00Z`))
