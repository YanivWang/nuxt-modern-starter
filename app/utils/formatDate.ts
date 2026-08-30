/*
  【文件职责】
    日期格式化 helper：ISO 日期截断、按 locale 的发布日期与工作台日期时间展示。
    formatPublishedDate 固定 UTC；formatWorkspaceDateTime 用本地时区。

  【架构位置】
    共享层 — app/utils，被新闻页、工作台组件消费。

  【主要导出 / 路由】
    formatDateOnly、formatPublishedDate、formatWorkspaceDateTime

  【依赖关系】
    - 依赖：config/site.ts（SupportedLocale）
    - 被引用：news 页面、WorkspaceProjectCard 等

  【渲染 / 数据】
    无 — 纯展示函数。

  【边界与注意】
    非法 ISO 字符串原样返回，避免 UI 崩溃。
*/
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

export const formatPublishedDate = (isoDate: string, locale: SupportedLocale) => {
  // publishedAt 既可能是纯日期（2026-07-04），也可能是完整时间戳（2026-07-04T17:58:23.000Z）。
  // 必须先经 formatDateOnly 归一化：直接拼 `${isoDate}T00:00:00Z` 在后者上会得到
  // "…000ZT00:00:00Z" → Invalid Date，而 Intl.format(Invalid Date) 抛 RangeError，
  // 在 SSR 的 /news 与 /news/:slug 上表现为整页 500。见 tests/unit/format-date.test.ts。
  const date = new Date(`${formatDateOnly(isoDate)}T00:00:00Z`)

  if (Number.isNaN(date.getTime())) {
    return isoDate
  }

  // 新闻发布日期固定 UTC，避免用户时区导致「同一天」显示不一致
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'
  }).format(date)
}

export const formatWorkspaceDateTime = (isoDate: string, locale: SupportedLocale) => {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) {
    return isoDate
  }

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: locale === 'zh-CN' ? 'long' : 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date)
}
