/*
  【文件职责】
    按块计算文件 / 分片 MD5（小写 hex），供 large-upload init 与 X-Chunk-Md5 使用。

  【架构位置】
    登录产品区 — app/features/editor/upload，被 useLargeFileUpload 调用。

  【主要导出 / 路由】
    computeFileMd5、computeChunkMd5、md5ReadConcurrency、COMPUTE_FILE_MD5_PART_BYTES

  【依赖关系】
    - 依赖：spark-md5、compute-file-md5.worker.ts
    - 被引用：useLargeFileUpload.ts

  【渲染 / 数据】
    仅客户端文件上传链路；整文件 MD5 优先 Worker，Worker 不可用时回退主线程。

  【边界与注意】
    Worker 读取可并发，但 append 顺序由 worker 保证；主线程 fallback 串行 append。
    AbortSignal 在 Worker 与 fallback 两条路径都必须转换为 AbortError。
*/
import SparkMD5 from 'spark-md5'

/** 单块读取大小（Worker 内多路并发读 + 顺序 append） */
export const COMPUTE_FILE_MD5_PART_BYTES = 8 * 1024 * 1024

export type ComputeFileMd5Result = {
  md5: string
  durationMs: number
}

type WorkerToMain =
  { type: 'done'; md5: string; durationMs: number } | { type: 'error'; message: string }

export const md5ReadConcurrency = () => {
  if (typeof navigator === 'undefined') return 4
  const n = navigator.hardwareConcurrency ?? 4
  // 限制在 1~16，避免高核心设备一次读取过多 ArrayBuffer 占用内存。
  return Math.min(Math.max(1, n), 16)
}

const computeFileMd5MainThread = async (
  file: File,
  signal: AbortSignal | undefined,
  partSize: number
): Promise<ComputeFileMd5Result> => {
  const t0 = performance.now()
  const spark = new SparkMD5.ArrayBuffer()
  for (let start = 0; start < file.size; start += partSize) {
    if (signal?.aborted) {
      throw new DOMException('aborted', 'AbortError')
    }
    const end = Math.min(start + partSize, file.size)
    const buf = await file.slice(start, end).arrayBuffer()
    spark.append(buf)
  }
  const md5 = spark.end()
  const durationMs = Number((performance.now() - t0).toFixed(1))
  return { md5, durationMs }
}

/** 整文件 MD5；优先 Web Worker，不可用时回退主线程 */
export const computeFileMd5 = async (
  file: File,
  signal?: AbortSignal
): Promise<ComputeFileMd5Result> => {
  if (typeof Worker === 'undefined') {
    return computeFileMd5MainThread(file, signal, COMPUTE_FILE_MD5_PART_BYTES)
  }

  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./compute-file-md5.worker.ts', import.meta.url), {
      type: 'module'
    })

    let settled = false
    const cleanup = () => {
      signal?.removeEventListener('abort', onAbort)
    }
    const settle = (fn: () => void) => {
      if (settled) return
      settled = true
      cleanup()
      worker.terminate()
      fn()
    }

    const onAbort = () => {
      // 先通知 Worker 停止，再 reject；settle 会 terminate，避免后台继续读大文件。
      worker.postMessage({ type: 'abort' })
      settle(() => reject(new DOMException('aborted', 'AbortError')))
    }

    if (signal?.aborted) {
      worker.terminate()
      reject(new DOMException('aborted', 'AbortError'))
      return
    }
    signal?.addEventListener('abort', onAbort, { once: true })

    worker.onmessage = (ev: MessageEvent<WorkerToMain>) => {
      if (settled) return
      const d = ev.data
      if (d.type === 'done') {
        settle(() => resolve({ md5: d.md5, durationMs: d.durationMs }))
      } else {
        settle(() =>
          d.message === 'AbortError'
            ? reject(new DOMException('aborted', 'AbortError'))
            : reject(new Error(d.message))
        )
      }
    }

    worker.onerror = (ev) => {
      if (settled) return
      settle(() => reject(ev.error ?? new Error(ev.message)))
    }

    worker.postMessage({
      type: 'init',
      file,
      partSize: COMPUTE_FILE_MD5_PART_BYTES,
      readConcurrency: md5ReadConcurrency()
    })
  })
}

/** 单分片 MD5，与 PUT 请求头 X-Chunk-Md5 一致 */
export const computeChunkMd5 = async (blob: Blob, signal?: AbortSignal): Promise<string> => {
  if (signal?.aborted) {
    throw new DOMException('aborted', 'AbortError')
  }
  const buf = await blob.arrayBuffer()
  if (signal?.aborted) {
    throw new DOMException('aborted', 'AbortError')
  }
  const spark = new SparkMD5.ArrayBuffer()
  spark.append(buf)
  return spark.end()
}
