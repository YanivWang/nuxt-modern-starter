/*
  【文件职责】
    编辑器 feature 局部类型：页面传入的项目上下文与编辑器常量。

  【架构位置】
    登录产品区 — app/features/editor/types.ts。
*/
import type { WorkspaceProject } from '~/types/workspace-project'

export type EditorProjectContext = Pick<WorkspaceProject, 'id' | 'title'>

/** 编辑器内容变更后自动保存 debounce（毫秒），由 useEditorWorkspace 传入 useEditorAutosave */
export const EDITOR_AUTOSAVE_DEBOUNCE_MS = 2000
