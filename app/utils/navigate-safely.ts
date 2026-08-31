/*
  【文件职责】
    包一层 router.push，保证一次「事后跳转」永远不会 reject。

  【架构位置】
    共享层 — app/utils，被切换语言与退出登录这类 click handler 消费。

  【主要导出 / 路由】
    pushSafely

  【依赖关系】
    - 依赖：vue-router 类型
    - 被引用：app/composables/useLanguageSwitch.ts、AccountPage、UserAccountMenu、
      tests/unit/navigate-safely.test.ts

  【渲染 / 数据】
    纯包装，不触碰 window，可在 SSR 与单测中直接调用。

  【边界与注意】
    调用方都是 click handler 里的 async 函数，它们的返回值没人接。
    push() 一旦 reject，应用里就没有任何 catch —— 只会变成一条 unhandled rejection：
    浏览器里被全局 error reporter 记一笔，测试里则表现为随机归属到某个正在跑的用例上的
    unhandled error（「单独跑全绿、跑全量偶尔挂一次」）。

    而这条 rejection 是重复的：路由 middleware 抛错时 Nuxt 已经在 beforeEach 里
    用 showError 渲染了错误页，随后又把 Error 返回给 vue-router，于是 push() 再 reject 一次。
    接住它不会让用户少看到任何东西，只是不让重复的那份变成 unhandled。

    导航被中断或重复不会走到这里：vue-router 对那两种情况是 resolve 出 NavigationFailure，
    本来就不 reject。
*/
import type { RouteLocationRaw, Router } from 'vue-router'

export const pushSafely = async (router: Router, to: RouteLocationRaw): Promise<void> => {
  try {
    await router.push(to)
  } catch {
    // 错误页与错误上报都已由 Nuxt 与全局 reporter 覆盖，这里只负责不再往外抛
  }
}
