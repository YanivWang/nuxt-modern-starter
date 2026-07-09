/*
  【文件职责】
    编辑器内容纯工具：空白 HTML 判断与保存时间格式化。

  【架构位置】
    登录产品区 — app/features/editor/composables，被 EditorWorkspace 与单测消费。
*/
export const isBlankEditorContent = (html: string) => {
  const normalized = html
    .replace(/<br\s*\/?>/gi, '')
    .replace(/<\/?p[^>]*>/gi, '')
    .replace(/&nbsp;/gi, '')
    .trim()

  return normalized.length === 0
}

export const formatEditorSavedAt = (timestamp: number) => {
  const date = new Date(timestamp)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}
