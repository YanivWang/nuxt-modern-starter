/*
  【文件职责】
    大文件分片上传 composable：MD5 → init → 并发 PUT 分片 → merge，支持断点续传与秒传。

  【架构位置】
    登录产品区 — app/features/editor/upload，被 useEditorMediaUpload 消费。

  【主要导出 / 路由】
    useLargeFileUpload

  【依赖关系】
    - 依赖：createLargeFileUploadApi、computeFileMd5、large-upload-persistence、constants
    - 被引用：composables/useEditorMediaUpload.ts

  【渲染 / 数据】
    CSR；成功返回 { url }（绝对 /uploads/large/... URL）。

  【边界与注意】
    首次上传会先算整文件 MD5；API 若返回 instant=true 则走秒传，不再 PUT 分片。
    localStorage 只保存 uploadId，真正续传前仍用 getStatus 校验文件名、大小与任务状态。
    进度条 0~95 留给 MD5 + PUT，merge 固定从 96 到 100，避免上传完成前显示满格。
*/
import { computed, ref, shallowRef } from 'vue'
import { createLargeFileUploadApi } from '../upload-api'
import {
  LARGE_UPLOAD_DEFAULT_CHUNK_SIZE,
  LARGE_UPLOAD_MAX_FILE_BYTES,
  LARGE_UPLOAD_MAX_FILE_MB
} from './constants'
import { computeChunkMd5, computeFileMd5 } from './compute-file-md5'
import {
  clearPendingUploadId,
  readPendingUploadId,
  writePendingUploadId
} from './large-upload-persistence'
import type {
  LargeFileUploadFileOptions,
  LargeFileUploadOptions,
  LargeFileUploadPhase,
  LargeUploadInitResponse
} from './types'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

const runPool = async <T>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<void>
): Promise<void> => {
  let next = 0
  const n = items.length
  if (n === 0) return
  const c = Math.min(Math.max(1, concurrency), n)

  const runners = Array.from({ length: c }, async () => {
    while (true) {
      const i = next++
      if (i >= n) break
      const item = items[i]
      if (item === undefined) break
      await worker(item, i)
    }
  })
  await Promise.all(runners)
}

const isRetryable = (err: unknown): boolean => {
  if (!err || typeof err !== 'object') return false
  const e = err as { type?: string; status?: number; statusCode?: number; message?: string }
  if (e.type === 'canceled') return false
  const status = e.status ?? e.statusCode
  return (
    e.type === 'network' || e.type === 'timeout' || (typeof status === 'number' && status >= 500)
  )
}

const UPLOAD_PROGRESS_PREP_FLOOR = 22

const startMd5PrepProgress = (progress: { value: number }, ceiling: number): (() => void) => {
  const t0 = performance.now()
  const tauMs = 1100
  let raf = 0
  const step = () => {
    const elapsed = performance.now() - t0
    const p = ceiling * (1 - Math.exp(-elapsed / tauMs))
    progress.value = Math.min(ceiling, Math.round(p * 10) / 10)
    if (progress.value < ceiling - 0.05) {
      raf = requestAnimationFrame(step)
    }
  }
  raf = requestAnimationFrame(step)
  return () => {
    cancelAnimationFrame(raf)
  }
}

export const useLargeFileUpload = (options: LargeFileUploadOptions = {}) => {
  const api = createLargeFileUploadApi()

  const chunkSize = options.chunkSize ?? LARGE_UPLOAD_DEFAULT_CHUNK_SIZE
  const concurrency = options.concurrency ?? 4
  const maxRetries = options.maxRetries ?? 2

  const phase = ref<LargeFileUploadPhase>('idle')
  const progress = ref(0)
  const errorMessage = ref<string | null>(null)
  const resultUrl = ref<string | null>(null)

  const currentUploadId = shallowRef<string | null>(null)
  const lastFile = shallowRef<File | null>(null)
  const abortRef = shallowRef<AbortController | null>(null)
  const pauseRequested = ref(false)

  const canResume = computed(
    () => phase.value === 'error' && currentUploadId.value != null && lastFile.value != null
  )

  const waitWhilePaused = async (ac: AbortController) => {
    while (pauseRequested.value) {
      if (ac.signal.aborted) {
        throw new Error('已取消')
      }
      await sleep(50)
    }
    if (ac.signal.aborted) {
      throw new Error('已取消')
    }
  }

  const pause = () => {
    if (phase.value !== 'uploading') return
    pauseRequested.value = true
    phase.value = 'paused'
  }

  const resume = () => {
    if (phase.value !== 'paused') return
    pauseRequested.value = false
    phase.value = 'uploading'
  }

  const cancel = () => {
    pauseRequested.value = false
    abortRef.value?.abort()
    phase.value = 'canceled'
    progress.value = 0
  }

  const uploadFile = async (
    file: File,
    fileOpts: LargeFileUploadFileOptions = {}
  ): Promise<{ url: string }> => {
    const ac = new AbortController()
    abortRef.value = ac
    errorMessage.value = null
    resultUrl.value = null
    progress.value = 0

    try {
      if (!file.size) {
        phase.value = 'error'
        errorMessage.value = '不能上传空文件'
        throw new Error(errorMessage.value)
      }

      if (file.size > LARGE_UPLOAD_MAX_FILE_BYTES) {
        phase.value = 'error'
        errorMessage.value = `文件超过 ${LARGE_UPLOAD_MAX_FILE_MB}MB 上限`
        throw new Error(errorMessage.value)
      }

      try {
        pauseRequested.value = false
        phase.value = 'init'

        let uploadId: string
        let status: Awaited<ReturnType<typeof api.getStatus>>
        let usePrepProgressBand = false

        if (fileOpts.resumeUploadId) {
          uploadId = fileOpts.resumeUploadId
          lastFile.value = file
          status = await api.getStatus(uploadId)

          if (status.status === 'done' && status.publicUrl) {
            clearPendingUploadId(file)
            progress.value = 100
            phase.value = 'done'
            resultUrl.value = status.publicUrl
            currentUploadId.value = null
            lastFile.value = null
            return { url: status.publicUrl }
          }

          if (status.fileName == null || status.fileSize == null || status.chunkSize == null) {
            throw new Error('无法续传：任务缺少文件元信息或已失效')
          }
          // uploadId 来自本地缓存或 retryResume，必须再次校验文件元信息，防止错文件续传到旧任务。
          if (file.name !== status.fileName || file.size !== status.fileSize) {
            throw new Error('续传须使用与原任务相同的文件（名称与大小一致）')
          }
          currentUploadId.value = uploadId
        } else {
          currentUploadId.value = null
          const storedId = readPendingUploadId(file)
          if (storedId) {
            try {
              const probe = await api.getStatus(storedId)
              if (probe.status === 'done' && probe.publicUrl) {
                clearPendingUploadId(file)
              } else if (
                probe.fileName != null &&
                probe.fileSize != null &&
                file.name === probe.fileName &&
                file.size === probe.fileSize
              ) {
                return await uploadFile(file, { resumeUploadId: storedId })
              } else {
                clearPendingUploadId(file)
              }
            } catch {
              clearPendingUploadId(file)
            }
          }

          usePrepProgressBand = true
          const stopMd5Prep = startMd5PrepProgress(progress, UPLOAD_PROGRESS_PREP_FLOOR)
          try {
            const { md5: fileMd5 } = await computeFileMd5(file, ac.signal)
            const init: LargeUploadInitResponse = await api.init({
              fileName: file.name,
              fileSize: file.size,
              chunkSize,
              mimeType: file.type || undefined,
              fileMd5
            })
            if (!init.instant) {
              uploadId = init.uploadId
              currentUploadId.value = uploadId
              lastFile.value = file
              writePendingUploadId(file, uploadId)
              status = await api.getStatus(uploadId)
            } else {
              const instantUrl = init.publicUrl
              clearPendingUploadId(file)
              progress.value = 100
              phase.value = 'done'
              resultUrl.value = instantUrl
              currentUploadId.value = null
              lastFile.value = null
              return { url: instantUrl }
            }
          } finally {
            stopMd5Prep()
          }
        }

        const prepFloor = usePrepProgressBand ? UPLOAD_PROGRESS_PREP_FLOOR : 0
        const prepSpan = usePrepProgressBand ? 95 - UPLOAD_PROGRESS_PREP_FLOOR : 95

        const effectiveChunkSize = status.chunkSize ?? chunkSize
        const { chunkTotal } = status
        const received = new Set(status.receivedIndices ?? [])
        const pending = Array.from({ length: chunkTotal }, (_, i) => i).filter(
          (i) => !received.has(i)
        )

        const initialCompleted = chunkTotal - pending.length
        // 续传任务把已收到分片折算进 0~95 区间；merge 前永远不显示 100。
        progress.value = Math.min(
          95,
          prepFloor + Math.round((initialCompleted / chunkTotal) * prepSpan)
        )

        let completed = 0
        phase.value = 'uploading'

        await runPool(pending, concurrency, async (index) => {
          if (ac.signal.aborted) throw new Error('已取消')
          await waitWhilePaused(ac)

          const start = index * effectiveChunkSize
          const end = Math.min(start + effectiveChunkSize, file.size)
          const blob = file.slice(start, end)
          const chunkMd5 = await computeChunkMd5(blob, ac.signal)

          let attempt = 0
          while (true) {
            await waitWhilePaused(ac)
            try {
              await api.putChunk(uploadId, index, blob, chunkMd5, { signal: ac.signal })
              completed += 1
              progress.value = Math.min(
                95,
                prepFloor + Math.round(((initialCompleted + completed) / chunkTotal) * prepSpan)
              )
              return
            } catch (e) {
              if (ac.signal.aborted || (e as Error)?.message === '已取消') {
                throw e
              }
              attempt++
              if (attempt > maxRetries || !isRetryable(e)) {
                throw e
              }
              await waitWhilePaused(ac)
              await sleep(500 * attempt)
            }
          }
        })

        if (ac.signal.aborted) {
          phase.value = 'canceled'
          throw new DOMException('aborted', 'AbortError')
        }

        phase.value = 'merging'
        progress.value = 96
        const merged = await api.merge(uploadId)
        progress.value = 100
        phase.value = 'done'
        resultUrl.value = merged.url
        clearPendingUploadId(file)
        currentUploadId.value = null
        lastFile.value = null
        return { url: merged.url }
      } catch (e) {
        const canceled =
          e instanceof DOMException && e.name === 'AbortError'
            ? true
            : (e as Error)?.message === '已取消' || (e as { type?: string })?.type === 'canceled'

        const msg = canceled ? '已取消' : e instanceof Error ? e.message : '上传失败'

        if (canceled) {
          phase.value = 'canceled'
          errorMessage.value = msg
          const id = currentUploadId.value
          if (id) {
            await api.abort(id).catch(() => {})
          }
          clearPendingUploadId(file)
          currentUploadId.value = null
          lastFile.value = null
        } else {
          phase.value = 'error'
          errorMessage.value = msg
        }
        throw e
      }
    } finally {
      pauseRequested.value = false
      abortRef.value = null
    }
  }

  const retryResume = async (): Promise<{ url: string }> => {
    const f = lastFile.value
    const id = currentUploadId.value
    if (!f || !id) {
      throw new Error('当前没有可续传的上传任务')
    }
    return uploadFile(f, { resumeUploadId: id })
  }

  return {
    phase,
    progress,
    errorMessage,
    resultUrl,
    currentUploadId,
    lastFile,
    canResume,
    uploadFile,
    retryResume,
    pause,
    resume,
    cancel
  }
}
