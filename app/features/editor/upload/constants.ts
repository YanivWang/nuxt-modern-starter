/*
  【文件职责】
    大文件上传容量常量，与 nuxt-modern-starter-api largeUpload.ts 对齐。
*/
/** 单文件最大字节数（1024MB），与 API LARGE_UPLOAD_MAX_FILE_BYTES 一致 */
export const LARGE_UPLOAD_MAX_FILE_BYTES = 1024 * 1024 * 1024

/** 用于提示文案的整数 MB */
export const LARGE_UPLOAD_MAX_FILE_MB = LARGE_UPLOAD_MAX_FILE_BYTES / (1024 * 1024)

/** 默认分片大小 5MB（须落在 API 1MB～8MB 限制内） */
export const LARGE_UPLOAD_DEFAULT_CHUNK_SIZE = 5 * 1024 * 1024
