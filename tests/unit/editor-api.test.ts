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
