import { describe, expect, it, vi } from 'vitest'

const apiMocks = vi.hoisted(() => ({
  request: vi.fn()
}))

vi.mock('../../app/apis/editor/client', () => ({
  createEditorApiClient: () => ({
    request: apiMocks.request
  })
}))

describe('editor API boundary', () => {
  it('reads editor documents through the authenticated editor request entrypoint', async () => {
    const { fetchEditorDocument } = await import('../../app/apis/editor/document')

    fetchEditorDocument('doc_1')

    expect(apiMocks.request).toHaveBeenCalledWith('/editor/documents/doc_1', {
      method: 'GET'
    })
  })

  it('saves editor documents through the authenticated editor request entrypoint', async () => {
    const { saveEditorDocument } = await import('../../app/apis/editor/document')

    saveEditorDocument('doc_1', {
      title: 'Draft',
      content: '<p>Hello</p>'
    })

    expect(apiMocks.request).toHaveBeenCalledWith('/editor/documents/doc_1', {
      method: 'PATCH',
      body: {
        title: 'Draft',
        content: '<p>Hello</p>'
      }
    })
  })
})
