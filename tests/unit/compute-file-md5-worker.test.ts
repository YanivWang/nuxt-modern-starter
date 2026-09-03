/*
  【文件职责】
    单测：MD5 Worker 的调度与顺序保证。直接驱动 worker 模块本身，不复刻它的算法。

  【架构位置】
    tests/unit — app/features/editor/upload/compute-file-md5.worker.ts，
    用假的 self 与 File 替身在 happy-dom 里跑，无需真实 Worker。

  【主要导出 / 路由】
    describe compute-file-md5 worker

  【依赖关系】
    - 依赖：worker 模块、spark-md5
    - mock：self（postMessage 收集消息）、File（slice().arrayBuffer() 可控完成顺序）

  【渲染 / 数据】
    无

  【边界与注意】
    这里守两件事：并发读不能打乱 append 顺序（否则同一文件算出错误 hash），
    以及「读完但没轮到 append」的窗口必须有上限（否则 buffers 上限是整个文件大小，1GB 文件直接 OOM）。
    两者都只在「靠前的分片读得比后面慢」时才暴露，因此用例刻意把 0 号分片挂住。
*/
import SparkMD5 from 'spark-md5'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

type WorkerMessage = { type: 'done'; md5: string } | { type: 'error'; message: string }

const PART = 4
const READ_CONCURRENCY = 3

/** 每片内容是可辨识的固定字节，便于用 SparkMD5 独立算出期望值 */
const buildBytes = (chunkCount: number) =>
  Uint8Array.from({ length: chunkCount * PART }, (_, i) => i % 251)

/**
 * File 替身：记录每次 slice 的下标，并允许把指定分片的读取挂起，
 * 用来制造「靠前的分片最后才完成」这一关键场景。
 */
const createFileStub = (bytes: Uint8Array, holdIndex: number) => {
  const sliceCalls: number[] = []
  let releaseHeld: (() => void) | undefined
  const held = new Promise<void>((resolve) => {
    releaseHeld = resolve
  })

  const file = {
    size: bytes.byteLength,
    slice(start: number, end: number) {
      sliceCalls.push(start / PART)
      return {
        async arrayBuffer() {
          if (start / PART === holdIndex) {
            await held
          }
          return bytes.slice(start, end).buffer
        }
      }
    }
  }

  return { file, sliceCalls, release: () => releaseHeld?.() }
}

const flush = async () => {
  for (let i = 0; i < 50; i += 1) {
    await Promise.resolve()
  }
}

describe('compute-file-md5 worker', () => {
  let messages: WorkerMessage[]
  let handleMessage: ((event: { data: unknown }) => void) | undefined

  beforeEach(async () => {
    vi.resetModules()
    messages = []
    handleMessage = undefined

    vi.stubGlobal('self', {
      postMessage: (message: WorkerMessage) => messages.push(message),
      set onmessage(handler: (event: { data: unknown }) => void) {
        handleMessage = handler
      }
    })

    await import('../../app/features/editor/upload/compute-file-md5.worker')
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('appends chunks in order even when reads finish out of order', async () => {
    const chunkCount = 8
    const bytes = buildBytes(chunkCount)
    // 挂住 0 号分片：它是最后一个完成的，后面所有分片都已读完在排队
    const { file, release } = createFileStub(bytes, 0)

    handleMessage?.({
      data: { type: 'init', file, partSize: PART, readConcurrency: READ_CONCURRENCY }
    })
    await flush()
    release()
    await flush()

    const spark = new SparkMD5.ArrayBuffer()
    spark.append(bytes.buffer)

    expect(messages).toEqual([expect.objectContaining({ type: 'done', md5: spark.end() })])
  })

  it('caps how far reading may run ahead of appending', async () => {
    const chunkCount = 32
    const bytes = buildBytes(chunkCount)
    const { file, sliceCalls, release } = createFileStub(bytes, 0)

    handleMessage?.({
      data: { type: 'init', file, partSize: PART, readConcurrency: READ_CONCURRENCY }
    })
    await flush()

    // 0 号还没完成，append 一片都推进不了。只限制并发读的话，
    // 每完成一片就再排一片，32 片会全部被读进内存排队等 0 号。
    expect(sliceCalls.length).toBeLessThanOrEqual(READ_CONCURRENCY)

    release()
    await flush()

    const spark = new SparkMD5.ArrayBuffer()
    spark.append(bytes.buffer)
    expect(messages).toEqual([expect.objectContaining({ type: 'done', md5: spark.end() })])
    // 放开之后必须跑完，不能因为窗口约束卡死
    expect(sliceCalls.length).toBe(chunkCount)
  })
})
