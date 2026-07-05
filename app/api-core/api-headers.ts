export const createHeaders = (headers: HeadersInit = {}) => new Headers(headers)

export const createBearerHeaders = (token?: string | null, headers: HeadersInit = {}) => {
  const requestHeaders = createHeaders(headers)

  if (token) {
    requestHeaders.set('authorization', `Bearer ${token}`)
  }

  return requestHeaders
}

export const sanitizeHeaders = (headers: HeadersInit = {}) => {
  const normalizedHeaders = createHeaders(headers)

  for (const key of ['authorization', 'cookie']) {
    if (normalizedHeaders.has(key)) {
      normalizedHeaders.set(key, '[redacted]')
    }
  }

  return Object.fromEntries(normalizedHeaders.entries())
}
