/*
  【文件职责】
    /docs/new 草稿创建流程：首次非空保存时创建项目、保存初始文档、同步本地 document、替换路由。

  【架构位置】
    登录产品区 — app/features/editor/composables，被 useEditorWorkspace 消费。

  【主要导出 / 路由】
    useDraftProject、UseDraftProjectOptions

  【依赖关系】
    - 依赖：workspace createProject、editor saveDocument、editor-content.ts
    - 入参：ensureDraftProject(contentToSave) —— 内容由调用方给，见该函数注释
    - 被引用：useEditorWorkspace.ts、tests/unit/editor-draft-project.test.ts

  【渲染 / 数据】
    CSR；/docs/new 没有后端 documentId，首次非空内容才创建 project + document。

  【边界与注意】
    createProject 返回初始 document 后仍会 PATCH 当前 HTML，确保用户首屏输入不丢。
    navigateToProject 使用 replace，避免浏览器后退回到已消费的 /docs/new 草稿页。
*/
import { computed, type Ref } from 'vue'
import { isBlankEditorContent } from './editor-content'
import type { CreateWorkspaceProjectPayload, WorkspaceProject } from '~/types/workspace-project'
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
  getTitle,
  createProject,
  saveDocument,
  navigateToProject,
  onProjectCreated
}: UseDraftProjectOptions) => {
  const isDraftMode = computed(() => !effectiveDocumentId.value && !draftDocumentId.value)

  /**
   * 要落盘的内容由调用方传入，本模块不再自己去读编辑器。
   *
   * 调用方（useEditorAutosave）必须知道「这一轮究竟存下去的是哪一份内容」，
   * 才能在 await 结束后拿它和当前内容比对、判断用户在这期间有没有继续输入。
   * 两边各自 getContentHtml() 的话，那次比对就变成了「和自己比」，永远相等。
   */
  const ensureDraftProject = async (contentToSave: string): Promise<string | null> => {
    if (effectiveDocumentId.value) {
      return effectiveDocumentId.value
    }

    // 空白内容不创建项目，与 scheduleAutosave 的空草稿 guard 对齐
    if (isBlankEditorContent(contentToSave)) {
      return null
    }

    const title = getTitle()
    const response = await createProject({ title })
    const { project, document: createdDocument } = response.data

    // createProject 只保证项目和初始文档存在；当前编辑器 HTML 要立即 PATCH，避免首段内容丢失。
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
