/*
  【文件职责】
    E2E：产品主闭环 —— 工作台列表、创建草稿、编辑器自动保存并把 /docs/new 换成真实项目、
    标题同步与删除项目。

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

const CREDENTIALS = { username: 'alice', password: 'correct-horse' }

const signIn = async (page: import('@playwright/test').Page) => {
  await page.goto('/sign-in')
  await page.locator('input[autocomplete="username"]').fill(CREDENTIALS.username)
  await page.locator('input[autocomplete="current-password"]').fill(CREDENTIALS.password)
  await page.getByRole('button', { name: /登录|Sign in/i }).click()
  await expect(page).toHaveURL(/\/workspace$/)
}

test.describe('workspace and editor', () => {
  test.beforeEach(async ({ request }) => {
    await request.post('http://127.0.0.1:2027/api/__reset')
  })

  test('lists projects and opens one in the editor', async ({ page }) => {
    await signIn(page)
    await page.locator('.workspace-card__title').click()

    await expect(page).toHaveURL(/\/docs\/project_1$/)
    await expect(page.locator('.editor-workspace-header__title')).toHaveText('Quarterly plan')
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

    await page.locator('.workspace-card__more').click()
    await page.getByRole('button', { name: /^删除$|^Delete$/i }).click()
    await page
      .getByRole('button', { name: /^删除$|^Delete$/i })
      .last()
      .click()

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
