/*
  【文件职责】
    将 API 返回的相对上传路径（/uploads/...）转为可跨域访问的绝对 URL。
    NUXT_PUBLIC_API_BASE 形如 http://host:port/api，静态资源挂在同 origin 的 /uploads。
*/
export const getUploadOrigin = (apiBase: string) => apiBase.replace(/\/api\/?$/, '')

/** 相对 /uploads/... → 绝对 URL；已是 http(s) 则原样返回 */
export const resolveUploadUrl = (url: string, apiBase: string) => {
  if (!url) return url
  if (/^https?:\/\//i.test(url)) return url
  if (!url.startsWith('/')) return url

  const origin = getUploadOrigin(apiBase)
  return `${origin}${url}`
}
