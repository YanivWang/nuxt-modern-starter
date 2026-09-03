/*
  【文件职责】
    将 API 返回的相对上传路径（/uploads/...）转为可跨域访问的绝对 URL。
    后端把静态资源挂在应用根的 /uploads（express.static，见 API 仓库 src/app.ts），
    业务接口才挂在版本前缀下 —— 所以媒体 URL 要用「剥掉版本前缀后的 base」来拼。

  【边界与注意】
    前缀必须按 /api[/vN] 整体剥，不能只认 /api：
    NUXT_PUBLIC_API_BASE 从 .../api 迁到 .../api/v1 时，只认 /api 的写法会静默留下版本段，
    把每个媒体 URL 拼成 .../api/v1/uploads/...（404），页面上只表现为图片裂开。
    tests/unit/editor-upload-api.test.ts 用真实 runtimeConfig 的 apiBase 反推期望值，
    不再在测试里复制一份剥前缀的实现 —— 那正是上一次漂移没被发现的原因。
*/

/** 后端业务接口的版本前缀形状：/api 或 /api/vN，与 API 仓库 API_VERSION_PREFIX 同源 */
const API_PREFIX_PATTERN = /\/api(?:\/v\d+)?$/

/** 剥掉 API 版本前缀，得到静态资源所在的 origin（同源部署时为空串） */
export const getUploadOrigin = (apiBase: string) => {
  const base = apiBase.replace(/\/+$/, '')

  if (API_PREFIX_PATTERN.test(base)) {
    return base.replace(API_PREFIX_PATTERN, '')
  }

  // base 不带已知版本前缀（配置本身已违反契约）时退回 URL origin：
  // 宁可丢掉未知子路径，也不能把 API 路径拼进媒体 URL —— 后者必然 404。
  try {
    return new URL(base).origin
  } catch {
    return base
  }
}

/** 相对 /uploads/... → 绝对 URL；已是 http(s) 则原样返回 */
export const resolveUploadUrl = (url: string, apiBase: string) => {
  if (!url) return url
  if (/^https?:\/\//i.test(url)) return url
  if (!url.startsWith('/')) return url

  const origin = getUploadOrigin(apiBase)
  return `${origin}${url}`
}
