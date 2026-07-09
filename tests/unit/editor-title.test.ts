/*
  【文件职责】
    单测：useEditorTitle，确保标题编辑状态和双写保存逻辑独立于 EditorWorkspace 组件。
*/
import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { useEditorTitle } from '../../app/features/editor/composables/useEditorTitle'
import { editorDocumentFixture } from '../fixtures/editor'

describe('useEditorTitle', () => {
  it('persists title to document and project when it changes', async () => {
    const editorDocument = ref({
      ...editorDocumentFixture,
      title: 'Original',
      content: '<p>Old</p>'
    })
    const lastSavedAt = ref<number | null>(null)
    const saveDocument = vi.fn().mockResolvedValue({
      data: {
        document: {
          ...editorDocumentFixture,
          title: 'Renamed',
          content: '<p>Current</p>'
        }
      }
    })
    const updateProject = vi.fn().mockResolvedValue({
      data: {
        project: {
          id: 'project_1',
          title: 'Renamed'
        }
      }
    })
    const onProjectUpdated = vi.fn()

    const title = useEditorTitle({
      project: ref({ id: 'project_1', title: 'Original' }),
      document: editorDocument,
      defaultTitleText: ref('Untitled'),
      effectiveDocumentId: ref('document_1'),
      lastSavedAt,
      getContentHtml: () => '<p>Current</p>',
      saveDocument,
      updateProject,
      onProjectUpdated,
      notifyError: vi.fn()
    })

    title.startTitleEdit()
    title.editableTitle.value = ' Renamed '
    await title.commitTitleEdit()

    expect(saveDocument).toHaveBeenCalledWith('document_1', {
      title: 'Renamed',
      content: '<p>Current</p>'
    })
    expect(updateProject).toHaveBeenCalledWith('project_1', { title: 'Renamed' })
    expect(onProjectUpdated).toHaveBeenCalledWith({ id: 'project_1', title: 'Renamed' })
    expect(editorDocument.value?.title).toBe('Renamed')
    expect(lastSavedAt.value).toEqual(expect.any(Number))
    expect(title.localTitle.value).toBe('Renamed')
  })

  it('falls back to the default title for whitespace-only input', async () => {
    const saveDocument = vi.fn().mockResolvedValue({ data: { document: editorDocumentFixture } })
    const title = useEditorTitle({
      project: ref(null),
      document: ref({ ...editorDocumentFixture, title: 'Original' }),
      defaultTitleText: ref('Untitled'),
      effectiveDocumentId: ref('document_1'),
      lastSavedAt: ref(null),
      getContentHtml: () => '',
      saveDocument,
      updateProject: vi.fn(),
      onProjectUpdated: vi.fn(),
      notifyError: vi.fn()
    })

    title.startTitleEdit()
    title.editableTitle.value = '   '
    await title.commitTitleEdit()

    expect(saveDocument).toHaveBeenCalledWith('document_1', {
      title: 'Untitled',
      content: '<p></p>'
    })
  })
})
