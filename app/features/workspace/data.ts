export type WorkspaceProjectStatus = 'draft' | 'ready' | 'shared'

export type WorkspaceProject = {
  id: string
  title: string
  description: string
  updatedAt: string
  slideCount: number
  status: WorkspaceProjectStatus
  accent: 'blue' | 'green' | 'violet' | 'amber' | 'cyan' | 'rose'
  editPath: string
  previewPath: string
}

const createProject = (
  project: Omit<WorkspaceProject, 'editPath' | 'previewPath'>
): WorkspaceProject => ({
  ...project,
  editPath: `/app/workspace/${project.id}/edit`,
  previewPath: `/app/workspace/${project.id}/preview`
})

export const workspaceProjects = [
  createProject({
    id: 'openclaw-guide',
    title: 'OpenClaw 全面使用指南',
    description: '用于产品演示和客户培训的 16:9 使用指南。',
    updatedAt: '2026-07-05 10:24',
    slideCount: 18,
    status: 'ready',
    accent: 'blue'
  }),
  createProject({
    id: 'market-agent-plan',
    title: '营销方案 Agent 发布介绍',
    description: '面向官网和销售团队的一站式方案生成演示稿。',
    updatedAt: '2026-07-04 21:18',
    slideCount: 12,
    status: 'draft',
    accent: 'violet'
  }),
  createProject({
    id: 'ai-report-template',
    title: 'AI 数据报告模板',
    description: '从数据看板转成汇报型 PPT 的占位模板。',
    updatedAt: '2026-07-03 16:42',
    slideCount: 9,
    status: 'shared',
    accent: 'green'
  }),
  createProject({
    id: 'quarter-review',
    title: '季度复盘与增长计划',
    description: '复盘关键指标、增长机会和下一步行动。',
    updatedAt: '2026-07-02 09:35',
    slideCount: 24,
    status: 'ready',
    accent: 'amber'
  }),
  createProject({
    id: 'blank-product-story',
    title: '新建产品故事线',
    description: '空白产品介绍稿，适合从结构大纲开始编辑。',
    updatedAt: '2026-07-01 14:08',
    slideCount: 6,
    status: 'draft',
    accent: 'cyan'
  }),
  createProject({
    id: 'customer-case',
    title: '客户案例沉淀模板',
    description: '用于公开站点案例页和销售材料的故事型模板。',
    updatedAt: '2026-06-30 18:16',
    slideCount: 15,
    status: 'shared',
    accent: 'rose'
  })
] as const satisfies readonly WorkspaceProject[]

export const getWorkspaceProjectById = (projectId: string) =>
  workspaceProjects.find((project) => project.id === projectId) ?? null
