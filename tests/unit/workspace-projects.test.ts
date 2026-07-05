import { describe, expect, it } from 'vitest'
import { getWorkspaceProjectById, workspaceProjects } from '../../app/features/workspace'

describe('workspace projects', () => {
  it('exposes placeholder projects with app edit and preview targets', () => {
    expect(workspaceProjects.length).toBeGreaterThanOrEqual(4)

    for (const project of workspaceProjects) {
      expect(project.editPath).toBe(`/app/workspace/${project.id}/edit`)
      expect(project.previewPath).toBe(`/app/workspace/${project.id}/preview`)
    }
  })

  it('finds a project by id', () => {
    expect(getWorkspaceProjectById(workspaceProjects[0].id)).toEqual(workspaceProjects[0])
    expect(getWorkspaceProjectById('missing')).toBeNull()
  })
})
