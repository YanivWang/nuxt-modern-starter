// @vitest-environment nuxt
/*
  【文件职责】
    组件测试：WorkspaceProjectCard 的链接、本地化时间与删除事件。

  【架构位置】
    tests/component — mountSuspended 真实挂载，需 Nuxt 运行时。

  【主要导出 / 路由】
    describe WorkspaceProjectCard

  【依赖关系】
    - 依赖：app/features/workspace/components/WorkspaceProjectCard.vue、app/utils/formatDate.ts
    - mock：无

  【渲染 / 数据】
    客户端挂载；updatedAt 按 languageStore.currentLanguage 格式化。

  【边界与注意】
    share / download / favorite 是 UI 占位，只断言其 aria-label 存在，不断言行为。
*/
import { beforeEach, describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import WorkspaceProjectCard from '../../app/features/workspace/components/WorkspaceProjectCard.vue'
import { formatWorkspaceDateTime } from '../../app/utils/formatDate'
import { workspaceProjectFixture } from '../fixtures/workspace'
import { resetComponentTestState } from './support'

const mountCard = () =>
  mountSuspended(WorkspaceProjectCard, {
    props: { project: workspaceProjectFixture, docPath: '/docs/project_1' }
  })

describe('WorkspaceProjectCard', () => {
  beforeEach(resetComponentTestState)

  it('links both the preview and the title to the editor path', async () => {
    const wrapper = await mountCard()
    const hrefs = wrapper.findAll('a').map((link) => link.attributes('href'))

    expect(hrefs).toContain('/docs/project_1')
    expect(wrapper.get('.workspace-card__title').text()).toBe(workspaceProjectFixture.title)
  })

  it('formats updatedAt with the active UI locale', async () => {
    const wrapper = await mountCard()

    expect(wrapper.get('.workspace-card__meta-text').text()).toContain(
      formatWorkspaceDateTime(workspaceProjectFixture.updatedAt, 'zh-CN')
    )
  })

  it('carries the accent modifier class from the project data', async () => {
    const wrapper = await mountCard()

    expect(wrapper.get('article').classes()).toContain('workspace-card--violet')
  })

  it('keeps placeholder actions labelled but inert', async () => {
    const wrapper = await mountCard()
    const placeholderLabels = wrapper
      .findAll('.workspace-card__preview-action')
      .map((button) => button.attributes('aria-label'))

    expect(placeholderLabels).toHaveLength(3)
    expect(placeholderLabels.every(Boolean)).toBe(true)
    expect(wrapper.emitted('delete')).toBeUndefined()
  })
})
