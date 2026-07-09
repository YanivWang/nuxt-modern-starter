/*
  【文件职责】
    登录 redirect 开放重定向防护：仅允许站内相对 path，拒绝 //、协议、反斜杠等。
    resolveSafeRedirectPath 在非法 redirect 时回退 fallback。

  【架构位置】
    共享层 — app/utils，被 app/middleware/auth.ts、sign-in 页面消费。

  【主要导出 / 路由】
    isSafeRedirectPath、resolveSafeRedirectPath

  【依赖关系】
    - 依赖：无
    - 被引用：app/middleware/auth.ts、app/pages/[[language]]/sign-in.vue

  【渲染 / 数据】
    无

  【边界与注意】
    修改规则需同步 tests/unit/safe-redirect.test.ts。
*/
const UNSAFE_REDIRECT_PATTERN = /^\/[/\\]|[:\\]/ // 拒绝 //evil.com、反斜杠、带协议的路径

// 仅允许站内相对 path；// 开头或含协议一律拒绝
export const isSafeRedirectPath = (path: string) =>
  path.startsWith('/') && !path.startsWith('//') && !UNSAFE_REDIRECT_PATTERN.test(path)

export const resolveSafeRedirectPath = (redirect: string | undefined, fallback: string) => {
  if (typeof redirect === 'string' && isSafeRedirectPath(redirect)) {
    return redirect
  }

  return fallback
}
