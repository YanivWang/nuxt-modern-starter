/*
  【文件职责】
    营销归因参数持久化：从 URL query 捕获 utm_* / gclid 等，localStorage last-touch 按 key 合并。
    mergeAttributionIntoBody 将归因字段浅合并进注册请求 body。

  【架构位置】
    共享层 — app/utils，被 app/plugins/attribution.client.ts、app/api/auth.ts 消费。

  【主要导出 / 路由】
    saveAttributionParams、getAttributionParams、clearAttributionParams、mergeAttributionIntoBody、
    ATTRIBUTION_STORAGE_KEY、ATTRIBUTION_KEY_PATTERNS

  【依赖关系】
    - 依赖：无（client-only localStorage）
    - 被引用：attribution.client plugin、registerApi

  【渲染 / 数据】
    仅客户端；SSR 时 read/write 均为 no-op；无渠道 key 时不写 storage。

  【边界与注意】
    last-touch 按 key：本次 query 中的 key 覆盖 storage 同 key，其他 key 保留。
    修改 ATTRIBUTION_KEY_PATTERNS 需同步 tests/unit/attribution-params.test.ts。
*/
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

  // last-touch 按 key 合并：incoming 覆盖同 key，保留 storage 中其他 key
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
