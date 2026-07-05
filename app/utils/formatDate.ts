import type { SupportedLocale } from '../../config/site'

export const formatDateOnly = (isoDate: string) => {
  const datePart = isoDate.split('T')[0]
  if (datePart && /^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    return datePart
  }

  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) {
    return isoDate
  }

  return date.toISOString().slice(0, 10)
}

export const formatPublishedDate = (isoDate: string, locale: SupportedLocale) =>
  new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'
  }).format(new Date(`${isoDate}T00:00:00Z`))
