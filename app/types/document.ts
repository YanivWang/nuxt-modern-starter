/*
  【文件职责】
    产品文档实体类型：workspace 创建项目与 editor 读写文档 API 共用。
    content 为编辑器 HTML 字符串；updatedAt 为 ISO 时间戳。

  【架构位置】
    共享层 — app/types，被 workspace / editor feature 引用。
*/
export type EditorDocument = {
  id: string
  projectId: string
  title: string
  /** 编辑器 HTML 正文 */
  content: string
  /** ISO 8601，驱动 lastSavedAt 与列表 updatedAt 展示 */
  updatedAt: string
}
