/*
  【文件职责】
    客户端外部脚本延迟加载：deferMs 后向 document.head 追加 async script。
    已加载同 src 则跳过；SSR 环境直接 resolve。

  【架构位置】
    共享层 — app/utils，被 app/plugins/analytics.client.ts 消费。

  【主要导出 / 路由】
    loadExternalScript

  【依赖关系】
    - 依赖：无
    - 被引用：app/plugins/analytics.client.ts、tests/unit/load-script.test.ts

  【渲染 / 数据】
    client-only；默认 defer 3000ms。

  【边界与注意】
    加载失败 reject 并 console.warn 由调用方处理。
*/
const resolveDeferMs = (deferMs?: number) =>
  deferMs !== undefined && Number.isFinite(deferMs) && deferMs >= 0 ? deferMs : 3000

/** 在 deferMs 后向 document.head 追加 <script src async>；已加载同 src 则跳过；onerror reject */
export const loadExternalScript = (src: string, deferMs?: number): Promise<void> => {
  const delay = resolveDeferMs(deferMs)

  if (import.meta.server) {
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve()
      return
    }

    window.setTimeout(() => {
      const script = document.createElement('script')
      script.src = src
      script.async = true
      script.onload = () => resolve()
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
      document.head.appendChild(script)
    }, delay)
  })
}
