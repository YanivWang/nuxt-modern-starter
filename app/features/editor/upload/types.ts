/*
  【文件职责】
    大文件分片上传相关类型，与 API /uploads/large/* 响应体对齐。
*/
export type LargeUploadInitResponse =
  | {
      instant: true
      publicUrl: string
      chunkTotal: number
      expiresAt: string
    }
  | {
      instant: false
      uploadId: string
      chunkTotal: number
      expiresAt: string
    }

export type LargeUploadStatusResponse = {
  status: string
  chunkTotal: number
  receivedIndices: number[]
  publicUrl?: string
  fileName?: string
  fileSize?: number
  chunkSize?: number
}

export type LargeUploadMergeResponse = {
  url: string
  merged: boolean
}

export type LargeFileUploadPhase =
  'idle' | 'init' | 'uploading' | 'paused' | 'merging' | 'done' | 'error' | 'canceled'

export type LargeFileUploadFileOptions = {
  resumeUploadId?: string
}

export type LargeFileUploadOptions = {
  chunkSize?: number
  concurrency?: number
  maxRetries?: number
}
