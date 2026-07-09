/*
  【文件职责】
    单测：C 端个人创作者 SaaS 主链路契约（路由与导航层，不重复 composable 细节）。
*/
import { describe, expect, it } from 'vitest'
import { resolveSafeRedirectPath } from '../../app/utils/safe-redirect'
import { localizedPath } from '../../config/routes'
import { productNavItems } from '../../app/features/product-shell/config'
import { getWorkspaceDocPath, getWorkspaceNewDocPath } from '../../app/features/workspace'
import { editorProjectFixture } from '../fixtures/editor'

describe('personal creator product flow contract', () => {
  it('keeps login -> workspace -> new document -> editor -> workspace return as the core flow', () => {
    expect(resolveSafeRedirectPath(undefined, localizedPath('/workspace', 'zh-CN'))).toBe(
      '/workspace'
    )
    expect(getWorkspaceNewDocPath()).toBe('/docs/new')
    expect(getWorkspaceDocPath(editorProjectFixture.id)).toBe('/docs/project_1')
    expect(productNavItems.some((item) => item.path === '/workspace')).toBe(true)
  })
})
