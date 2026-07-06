export const ATTRIBUTION_STORAGE_KEY = 'attribution_params'

/** 精确匹配或正则；任意命中即视为渠道参数 */
export const ATTRIBUTION_KEY_PATTERNS: Array<string | RegExp> = [
  /^utm_/,
  'bd_vid',
  'clickid',
  'gclid',
  'msclkid',
  'fbclid',
  'ttclid'
]

const isAttributionKey = (key: string) =>
  ATTRIBUTION_KEY_PATTERNS.some((pattern) =>
    typeof pattern === 'string' ? pattern === key : pattern.test(key)
  )

const normalizeQueryValue = (value: unknown): string | null => {
  if (typeof value === 'string') {
    return value
  }

  if (Array.isArray(value)) {
    const first = value[0]
    return typeof first === 'string' ? first : null
  }

  return null
}

const readStoredParams = (): Record<string, string> => {
  if (import.meta.server || typeof localStorage === 'undefined') {
    return {}
  }

  try {
    const raw = localStorage.getItem(ATTRIBUTION_STORAGE_KEY)
    if (!raw) {
      return {}
    }

    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {}
    }

    return Object.fromEntries(
      Object.entries(parsed as Record<string, unknown>).filter(
        (entry): entry is [string, string] => typeof entry[1] === 'string'
      )
    )
  } catch {
    return {}
  }
}

const writeStoredParams = (params: Record<string, string>) => {
  if (import.meta.server || typeof localStorage === 'undefined') {
    return
  }

  if (Object.keys(params).length === 0) {
    localStorage.removeItem(ATTRIBUTION_STORAGE_KEY)
    return
  }

  localStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(params))
}

/** 从 query 提取渠道 key；按 key last-touch：本次 query 中的 key 覆盖 storage 同 key；无渠道 key 时不写 storage */
export const saveAttributionParams = (query: Record<string, unknown>): void => {
  const incoming: Record<string, string> = {}

  for (const [key, value] of Object.entries(query)) {
    if (!isAttributionKey(key)) {
      continue
    }

    const normalized = normalizeQueryValue(value)
    if (normalized !== null) {
      incoming[key] = normalized
    }
  }

  if (Object.keys(incoming).length === 0) {
    return
  }

  writeStoredParams({ ...readStoredParams(), ...incoming })
}

export const getAttributionParams = (): Record<string, string> => readStoredParams()

export const clearAttributionParams = (): void => {
  if (import.meta.server || typeof localStorage === 'undefined') {
    return
  }

  localStorage.removeItem(ATTRIBUTION_STORAGE_KEY)
}

/** 将已存归因字段浅合并进请求 body；SSR / 无 localStorage 时原样返回 body */
export const mergeAttributionIntoBody = <T extends Record<string, unknown>>(body: T): T =>
  ({ ...getAttributionParams(), ...body }) as T
