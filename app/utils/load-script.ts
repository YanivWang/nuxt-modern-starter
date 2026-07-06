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
