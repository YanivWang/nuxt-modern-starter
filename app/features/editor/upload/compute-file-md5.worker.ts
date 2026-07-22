/// <reference lib="webworker" />

/*
  【文件职责】
    Web Worker 版文件 MD5 计算：并发读取文件分片，但按原始分片顺序 append 到 SparkMD5。
    供 compute-file-md5.ts 在大文件上传 init 阶段 offload 主线程。

  【架构位置】
    登录产品区 — app/features/editor/upload，由 computeFileMd5 通过 new Worker(...) 启动。

  【主要导出 / 路由】
    无 ESM 导出；通过 self.onmessage 接收 init / abort，向主线程 postMessage done / error。

  【依赖关系】
    - 依赖：spark-md5、浏览器 File / Worker API
    - 被引用：app/features/editor/upload/compute-file-md5.ts

  【渲染 / 数据】
    仅客户端 Worker；输入 File、partSize、readConcurrency，输出小写 hex md5 与耗时。

  【边界与注意】
    MD5 append 必须保持分片顺序；并发只用于 arrayBuffer 读取，不能并发 append。
    AbortError 以字符串 message 回传，主线程再还原为 DOMException。
*/
import SparkMD5 from 'spark-md5'

type WorkerInit = {
  type: 'init'
  file: File
  partSize: number
  readConcurrency: number
}

type WorkerToMain =
  { type: 'done'; md5: string; durationMs: number } | { type: 'error'; message: string }

let aborted = false

const endMessage = (msg: WorkerToMain, finishedRef: { v: boolean }) => {
  if (finishedRef.v) return
  finishedRef.v = true
  self.postMessage(msg)
}

const runImpl = (init: WorkerInit, finishedRef: { v: boolean }) => {
  const { file, partSize, readConcurrency } = init
  const t0 = performance.now()
  const spark = new SparkMD5.ArrayBuffer()
  const chunkCount = file.size === 0 ? 0 : Math.ceil(file.size / partSize)

  if (chunkCount === 0) {
    const md5 = spark.end()
    endMessage(
      { type: 'done', md5, durationMs: Number((performance.now() - t0).toFixed(1)) },
      finishedRef
    )
    return
  }

  const buffers = new Map<number, ArrayBuffer>()
  let nextAppend = 0
  let nextSchedule = 0
  let inFlight = 0

  const tryAppend = () => {
    // 读取可并发完成，但 MD5 必须按 chunk index 顺序 append，避免同一文件得到错误 hash。
    while (nextAppend < chunkCount && buffers.has(nextAppend)) {
      if (aborted) {
        throw new DOMException('aborted', 'AbortError')
      }
      spark.append(buffers.get(nextAppend)!)
      buffers.delete(nextAppend)
      nextAppend++
    }
  }

  const checkDone = () => {
    if (finishedRef.v) return
    if (aborted) {
      endMessage({ type: 'error', message: 'AbortError' }, finishedRef)
      return
    }
    try {
      tryAppend()
    } catch (e) {
      const message =
        e instanceof DOMException && e.name === 'AbortError' ? 'AbortError' : String(e)
      endMessage({ type: 'error', message }, finishedRef)
      return
    }
    if (nextAppend === chunkCount && inFlight === 0) {
      try {
        const md5 = spark.end()
        endMessage(
          { type: 'done', md5, durationMs: Number((performance.now() - t0).toFixed(1)) },
          finishedRef
        )
      } catch (e) {
        endMessage(
          { type: 'error', message: e instanceof Error ? e.message : String(e) },
          finishedRef
        )
      }
    }
  }

  const schedule = () => {
    if (finishedRef.v) return
    if (aborted) {
      endMessage({ type: 'error', message: 'AbortError' }, finishedRef)
      return
    }
    while (inFlight < readConcurrency && nextSchedule < chunkCount) {
      const i = nextSchedule++
      inFlight++
      const start = i * partSize
      const end = Math.min(start + partSize, file.size)
      // File.slice().arrayBuffer() 在 Worker 内并发读；完成后先进入 buffers，等待 tryAppend 顺序消费。
      void file
        .slice(start, end)
        .arrayBuffer()
        .then((buf) => {
          inFlight--
          if (finishedRef.v) return
          if (aborted) {
            endMessage({ type: 'error', message: 'AbortError' }, finishedRef)
            return
          }
          buffers.set(i, buf)
          checkDone()
          schedule()
        })
        .catch((e) => {
          inFlight--
          if (finishedRef.v) return
          endMessage(
            { type: 'error', message: e instanceof Error ? e.message : String(e) },
            finishedRef
          )
        })
    }
    checkDone()
  }

  schedule()
}

self.onmessage = (ev: MessageEvent<WorkerInit | { type: 'abort' }>) => {
  const data = ev.data
  if (data.type === 'abort') {
    aborted = true
    return
  }
  if (data.type !== 'init') return

  aborted = false
  const finishedRef = { v: false }
  try {
    runImpl(data, finishedRef)
  } catch (e) {
    const message = e instanceof DOMException && e.name === 'AbortError' ? 'AbortError' : String(e)
    endMessage({ type: 'error', message }, finishedRef)
  }
}
