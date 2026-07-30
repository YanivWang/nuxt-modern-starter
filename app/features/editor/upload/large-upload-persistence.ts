/*
  【文件职责】
    按文件指纹把未完成的 large-upload uploadId 写入 localStorage，供刷新后续传。
*/
const PREFIX = 'nms-lu:'

type StoredShape = { uploadId: string }

// 文件名、大小、mtime 共同构成续传键；不同文件不能复用 uploadId。
const storageKey = (file: File) =>
  `${PREFIX}${encodeURIComponent(file.name)}\u001f${file.size}\u001f${file.lastModified}`

export const readPendingUploadId = (file: File): string | null => {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(storageKey(file))
    if (!raw) return null
    const o = JSON.parse(raw) as StoredShape
    return typeof o.uploadId === 'string' && o.uploadId.length > 0 ? o.uploadId : null
  } catch {
    return null
  }
}

export const writePendingUploadId = (file: File, uploadId: string): void => {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(storageKey(file), JSON.stringify({ uploadId }))
  } catch {
    /* 隐私模式 / 配额满 */
  }
}

export const clearPendingUploadId = (file: File): void => {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.removeItem(storageKey(file))
  } catch {
    /* ignore */
  }
}
