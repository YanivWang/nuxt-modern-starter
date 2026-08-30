/*
  【文件职责】
    E2E：产品主闭环 —— 工作台列表与分页「加载更多」、创建草稿、编辑器自动保存并把
    /docs/new 换成真实项目、标题同步与删除项目。

  【架构位置】
    tests/e2e/specs — Playwright，对 .output preview 服务运行。

  【依赖关系】
    - 依赖：app/features/workspace、app/features/editor、app/api/workspace-project.ts
    - mock：tests/e2e/stub-api 提供 /projects 与 /documents

  【边界与注意】
    编辑器是第三方组件（@yanivjs/yaniv-editor），断言只依赖「可编辑区域」与自身的 header，
    不依赖它的内部 DOM 结构，否则升级编辑器版本就会误报。
*/
import { expect, test } from '@playwright/test'
import { resetStub, signInToWorkspace as signIn } from '../support'

test.describe('workspace and editor', () => {
  test.beforeEach(async ({ request }) => {
    await resetStub(request)
  })

  test('lists projects and opens one in the editor', async ({ page }) => {
    await signIn(page)
    await page.locator('.workspace-card__title').click()

    await expect(page).toHaveURL(/\/docs\/project_1$/)
    await expect(page.locator('.editor-workspace-header__title')).toHaveText('Quarterly plan')
  })

  test('hides the load-more control when a single page covers everything', async ({ page }) => {
    await signIn(page)

    await expect(page.locator('.workspace-card')).toHaveCount(1)
    await expect(page.locator('.workspace-load-more')).toHaveCount(0)
  })

  test('pages through projects that exceed one page', async ({ page, request }) => {
    await resetStub(request, 25)
    await signIn(page)

    // 首屏只拿第一页；超出单页的项目必须仍可见 —— 这正是分页改造要解决的问题
    await expect(page.locator('.workspace-card')).toHaveCount(20)
    await expect(page.locator('.workspace-load-more')).toBeVisible()

    await page.locator('.workspace-load-more button').click()

    await expect(page.locator('.workspace-card')).toHaveCount(25)
    // 全部加载完后按钮消失，且不会重复追加已有项目
    await expect(page.locator('.workspace-load-more')).toHaveCount(0)
  })

  test('creates a draft from the single create entry', async ({ page }) => {
    await signIn(page)
    await page.locator('.workspace-dashboard__header button').click()

    await expect(page).toHaveURL(/\/docs\/new$/)
    await expect(page.locator('.editor-workspace-header')).toBeVisible()
  })

  test('promotes a non-empty draft into a real project and replaces the URL', async ({ page }) => {
    await signIn(page)
    await page.locator('.workspace-dashboard__header button').click()
    await expect(page).toHaveURL(/\/docs\/new$/)

    const editable = page.locator('[contenteditable="true"]').first()
    await editable.waitFor({ state: 'visible' })
    await editable.click()
    await editable.pressSequentially('Hello from e2e')

    // 首次非空自动保存会 createWorkspaceProject 并 router.replace 到真实 id
    await expect(page).toHaveURL(/\/docs\/project_\d+$/, { timeout: 30_000 })

    await page.goto('/workspace')
    await expect(page.locator('.workspace-card')).toHaveCount(2)
  })

  test('deletes a project and refreshes the list', async ({ page }) => {
    await signIn(page)
    await expect(page.locator('.workspace-card')).toHaveCount(1)

    // 用类选择器而不是按钮文案：Ant Design Vue 会在两个汉字之间插空格（「删除」→「删 除」），
    // 按文案匹配会漏掉 Popconfirm 里的确认按钮，删除请求根本不会发出。
    await page.locator('.workspace-card__more').click()
    await page.locator('.workspace-card__menu-delete').click()
    await page.locator('.ant-popconfirm-buttons button.ant-btn-primary').click()

    await expect(page.locator('.workspace-empty')).toBeVisible()
  })

  test('navigates back to the workspace from the editor', async ({ page }) => {
    await signIn(page)
    await page.locator('.workspace-card__title').click()
    await expect(page).toHaveURL(/\/docs\/project_1$/)

    await page.locator('.editor-workspace-header__back').click()
    await expect(page).toHaveURL(/\/workspace$/)
  })
})
