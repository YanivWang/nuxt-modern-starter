/*
  【文件职责】
    单测：editor api adapter GET/PATCH /documents/:id 路径。

  【架构位置】
    tests/unit — mock createProductApiClient。

  【主要导出 / 路由】
    describe editor api

  【依赖关系】
    - 依赖：app/features/editor/api.ts
    - mock：createProductApiClient → { request }

  【渲染 / 数据】
    无

  【边界与注意】
    不覆盖 EditorWorkspace autosave 集成；不测文档内容校验。
*/
import { describe, expect, it, vi } from 'vitest'

const request = vi.fn()

vi.mock('../../app/api/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../app/api/auth')>()
  return {
    ...actual,
    createProductApiClient: vi.fn(() => ({ request }))
  }
})

describe('editor api', () => {
  it('fetches editor documents', async () => {
    const { fetchEditorDocument } = await import('../../app/features/editor/api')

    await fetchEditorDocument('doc_1')

    expect(request).toHaveBeenCalledWith('/documents/doc_1', { method: 'GET' })
  })

  it('saves editor documents', async () => {
    const { saveEditorDocument } = await import('../../app/features/editor/api')

    await saveEditorDocument('doc_1', { content: 'hello' })

    expect(request).toHaveBeenCalledWith('/documents/doc_1', {
      method: 'PATCH',
      body: { content: 'hello' }
    })
  })
})
