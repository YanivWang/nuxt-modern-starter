/*
  【文件职责】
    编辑器 feature 局部类型：页面传入的项目上下文与编辑器常量。

  【架构位置】
    登录产品区 — app/features/editor/types.ts。
*/
import type { WorkspaceProject } from '~/features/workspace'

export type EditorProjectContext = Pick<WorkspaceProject, 'id' | 'title'>

export const EDITOR_AUTOSAVE_DEBOUNCE_MS = 2000
