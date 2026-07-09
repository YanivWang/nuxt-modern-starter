/*
  【文件职责】
    单测：useDraftProject，确保 /docs/new 仅在首次非空保存时创建项目并替换路由。
*/
import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { useDraftProject } from '../../app/features/editor/composables/useDraftProject'
import { editorDocumentFixture, editorProjectFixture } from '../fixtures/editor'

describe('useDraftProject', () => {
  it('does not create a project for blank draft content', async () => {
    const createProject = vi.fn()
    const saveDocument = vi.fn()
    const draftDocumentId = ref<string | null>(null)
    const editorDocument = ref(null)

    const { ensureDraftProject } = useDraftProject({
      effectiveDocumentId: ref<string | null>(null),
      draftDocumentId,
      document: editorDocument,
      getContentHtml: () => '<p><br></p>',
      getTitle: () => 'Untitled',
      createProject,
      saveDocument,
      navigateToProject: vi.fn(),
      onProjectCreated: vi.fn()
    })

    await expect(ensureDraftProject()).resolves.toBeNull()
    expect(createProject).not.toHaveBeenCalled()
    expect(saveDocument).not.toHaveBeenCalled()
    expect(draftDocumentId.value).toBeNull()
  })

  it('creates a project, saves initial content, notifies, and navigates to the real document route', async () => {
    const createProject = vi.fn().mockResolvedValue({
      data: { project: editorProjectFixture, document: editorDocumentFixture }
    })
    const saveDocument = vi.fn().mockResolvedValue({ data: { document: editorDocumentFixture } })
    const navigateToProject = vi.fn()
    const onProjectCreated = vi.fn()
    const draftDocumentId = ref<string | null>(null)
    const editorDocument = ref(null)

    const { ensureDraftProject } = useDraftProject({
      effectiveDocumentId: ref<string | null>(null),
      draftDocumentId,
      document: editorDocument,
      getContentHtml: () => '<p>First slide</p>',
      getTitle: () => 'My deck',
      createProject,
      saveDocument,
      navigateToProject,
      onProjectCreated
    })

    await expect(ensureDraftProject()).resolves.toBe('document_1')
    expect(createProject).toHaveBeenCalledWith({ title: 'My deck' })
    expect(saveDocument).toHaveBeenCalledWith('document_1', {
      title: 'My deck',
      content: '<p>First slide</p>'
    })
    expect(draftDocumentId.value).toBe('document_1')
    expect(editorDocument.value?.content).toBe('<p>First slide</p>')
    expect(onProjectCreated).toHaveBeenCalledWith(editorProjectFixture)
    expect(navigateToProject).toHaveBeenCalledWith('project_1')
  })
})
