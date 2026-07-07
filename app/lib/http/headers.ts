/*
  【文件职责】
    HTTP 请求头工具：Headers 归一化、Bearer token 注入、日志用 header 脱敏。
    sanitizeHeaders 将 authorization / cookie 替换为 [redacted]。

  【架构位置】
    共享层 — app/lib/http，被 client.ts、app/api/clients.ts 引用。

  【主要导出 / 路由】
    createHeaders、createBearerHeaders、sanitizeHeaders

  【依赖关系】
    - 依赖：无
    - 被引用：app/lib/http/client.ts、app/api/clients.ts

  【渲染 / 数据】
    无 — SSR 与 CSR 均可调用。

  【边界与注意】
    Public client 在 clients.ts 层 delete authorization/cookie，而非在此模块。
*/
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
