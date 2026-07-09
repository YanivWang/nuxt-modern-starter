/*
  【文件职责】
    单测：编辑器内容工具，确保空白 HTML 不会触发草稿项目创建。

  【架构位置】
    tests/unit — 纯函数测试。
*/
import { describe, expect, it } from 'vitest'
import {
  formatEditorSavedAt,
  isBlankEditorContent
} from '../../app/features/editor/composables/editor-content'

describe('editor content helpers', () => {
  it('treats empty paragraph markup as blank editor content', () => {
    expect(isBlankEditorContent('<p></p>')).toBe(true)
    expect(isBlankEditorContent('<p><br></p>')).toBe(true)
    expect(isBlankEditorContent('<p>&nbsp;</p>')).toBe(true)
  })

  it('treats real text as non-blank editor content', () => {
    expect(isBlankEditorContent('<p>Quarterly plan</p>')).toBe(false)
  })

  it('returns an empty saved-at label for invalid timestamps', () => {
    expect(formatEditorSavedAt(Number.NaN)).toBe('')
  })
})
