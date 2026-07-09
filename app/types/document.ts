/*
  【文件职责】
    产品文档实体类型：workspace 创建项目与 editor 读写文档 API 共用。

  【架构位置】
    共享层 — app/types，被 workspace / editor feature 引用。
*/
export type EditorDocument = {
  id: string
  projectId: string
  title: string
  content: string
  updatedAt: string
}
