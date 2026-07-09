/*
  【文件职责】
    单测：useEditorAutosave，确保 dirty 检测、草稿创建、文档保存和 flush 行为独立可测。
*/
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { useEditorAutosave } from '../../app/features/editor/composables/useEditorAutosave'
import { editorDocumentFixture } from '../fixtures/editor'

describe('useEditorAutosave', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('does not schedule autosave until the editor is ready and content changes', () => {
    vi.useFakeTimers()
    let html = '<p>Initial</p>'
    const saveDocument = vi.fn()
    const autosave = useEditorAutosave({
      effectiveDocumentId: ref('document_1'),
      isDraftMode: ref(false),
      document: ref(editorDocumentFixture),
      lastSavedAt: ref(null),
      getContentHtml: () => html,
      getTitle: () => 'Untitled',
      ensureDraftProject: vi.fn(),
      saveDocument,
      notifyError: vi.fn(),
      formatSaving: () => 'Saving',
      formatFailed: () => 'Failed',
      formatSaved: (time) => `Saved ${time}`,
      debounceMs: 10
    })

    autosave.scheduleAutosave()
    vi.advanceTimersByTime(20)
    expect(saveDocument).not.toHaveBeenCalled()

    autosave.markEditorReady()
    autosave.resetDirtyBaseline()
    html = '<p>Changed</p>'
    autosave.scheduleAutosave()
    vi.advanceTimersByTime(20)

    expect(saveDocument).toHaveBeenCalledWith('document_1', {
      title: 'Untitled',
      content: '<p>Changed</p>'
    })
  })

  it('creates a draft project before saving draft content', async () => {
    let html = '<p></p>'
    const effectiveDocumentId = ref<string | null>(null)
    const ensureDraftProject = vi.fn().mockImplementation(async () => {
      effectiveDocumentId.value = 'document_1'
      return 'document_1'
    })
    const saveDocument = vi.fn()
    const autosave = useEditorAutosave({
      effectiveDocumentId,
      isDraftMode: ref(true),
      document: ref(null),
      lastSavedAt: ref(null),
      getContentHtml: () => html,
      getTitle: () => 'Draft',
      ensureDraftProject,
      saveDocument,
      notifyError: vi.fn(),
      formatSaving: () => 'Saving',
      formatFailed: () => 'Failed',
      formatSaved: (time) => `Saved ${time}`,
      debounceMs: 10
    })

    autosave.markEditorReady()
    autosave.resetDirtyBaseline()
    html = '<p>Draft</p>'
    await autosave.persistDocument()

    expect(ensureDraftProject).toHaveBeenCalled()
    expect(saveDocument).not.toHaveBeenCalled()
    expect(autosave.dirty.value).toBe(false)
  })
})
