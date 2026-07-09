/*
  【文件职责】
    /docs/new 草稿创建流程：首次非空保存时创建项目、保存初始文档、同步本地 document、替换路由。

  【架构位置】
    登录产品区 — app/features/editor/composables，被 useEditorWorkspace 消费。
*/
import { computed, type Ref } from 'vue'
import { isBlankEditorContent } from './editor-content'
import type { CreateWorkspaceProjectPayload, WorkspaceProject } from '~/features/workspace'
import type { SaveEditorDocumentPayload } from '../api'
import type { EditorDocument } from '~/types/document'

type SaveDocumentResponse = Promise<{ data: { document: EditorDocument } }>
type CreateProjectResponse = Promise<{
  data: { project: WorkspaceProject; document: EditorDocument }
}>

export type UseDraftProjectOptions = {
  effectiveDocumentId: Ref<string | null>
  draftDocumentId: Ref<string | null>
  document: Ref<EditorDocument | null | undefined>
  getContentHtml: () => string
  getTitle: () => string
  createProject: (payload: CreateWorkspaceProjectPayload) => CreateProjectResponse
  saveDocument: (documentId: string, payload: SaveEditorDocumentPayload) => SaveDocumentResponse
  navigateToProject: (projectId: string) => Promise<unknown> | unknown
  onProjectCreated: (project: WorkspaceProject) => void
}

export const useDraftProject = ({
  effectiveDocumentId,
  draftDocumentId,
  document,
  getContentHtml,
  getTitle,
  createProject,
  saveDocument,
  navigateToProject,
  onProjectCreated
}: UseDraftProjectOptions) => {
  const isDraftMode = computed(() => !effectiveDocumentId.value && !draftDocumentId.value)

  const ensureDraftProject = async (): Promise<string | null> => {
    if (effectiveDocumentId.value) {
      return effectiveDocumentId.value
    }

    const contentToSave = getContentHtml()

    if (isBlankEditorContent(contentToSave)) {
      return null
    }

    const title = getTitle()
    const response = await createProject({ title })
    const { project, document: createdDocument } = response.data

    await saveDocument(createdDocument.id, {
      title,
      content: contentToSave
    })

    draftDocumentId.value = createdDocument.id
    document.value = {
      ...createdDocument,
      content: contentToSave
    }
    onProjectCreated(project)
    await navigateToProject(project.id)

    return createdDocument.id
  }

  return {
    isDraftMode,
    ensureDraftProject
  }
}
