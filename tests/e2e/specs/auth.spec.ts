/*
  【文件职责】
    E2E：鉴权闭环 —— 受保护路由拦截、登录跳转、会话恢复、退出，以及产品 URL 的语言中性 301。

  【架构位置】
    tests/e2e/specs — Playwright，对 .output preview 服务运行。

  【依赖关系】
    - 依赖：app/middleware/auth.ts、app/stores/auth.ts、app/utils/safe-redirect.ts
    - mock：tests/e2e/stub-api 提供 /login、/me、/projects

  【边界与注意】
    产品区是 CSR（ssr: false），首屏是空壳 + 客户端鉴权，因此断言必须等客户端跳转完成，
    不能只看首个响应的状态码。
*/
import { expect, test } from '@playwright/test'
import { APP_ORIGIN, CREDENTIALS, resetStub, signIn, waitForHydration } from '../support'

test.describe('authentication', () => {
  test.beforeEach(async ({ request }) => {
    await resetStub(request)
  })

  test('sends an anonymous visitor from a protected route to sign-in with a redirect back', async ({
    page
  }) => {
    await page.goto('/workspace')

    await expect(page).toHaveURL(`${APP_ORIGIN}/sign-in?redirect=/workspace`)
  })

  test('signs in and lands on the workspace', async ({ page }) => {
    await signIn(page)

    await expect(page).toHaveURL(/\/workspace$/)
    await expect(page.locator('.workspace-card__title')).toHaveText('Quarterly plan')
  })

  test('returns to the originally requested route after signing in', async ({ page }) => {
    await page.goto('/workspace/templates')
    await expect(page).toHaveURL(/\/sign-in\?redirect=/)

    await page.locator('input[autocomplete="username"]').fill(CREDENTIALS.username)
    await page.locator('input[autocomplete="current-password"]').fill(CREDENTIALS.password)
    await page.locator('form button[type="submit"]').click()

    await expect(page).toHaveURL(/\/workspace\/templates$/)
  })

  test('refuses an off-site redirect target', async ({ page }) => {
    await signIn(page, '/sign-in?redirect=https%3A%2F%2Fevil.example.com')

    // 开放重定向必须被 resolveSafeRedirectPath 挡掉并回退到默认目标
    await expect(page).toHaveURL(`${APP_ORIGIN}/workspace`)
  })

  test('rejects bad credentials without creating a session', async ({ page }) => {
    await page.goto('/sign-in')
    await page.locator('input[autocomplete="username"]').fill(CREDENTIALS.username)
    await page.locator('input[autocomplete="current-password"]').fill('wrong')
    await page.locator('form button[type="submit"]').click()

    await expect(page).toHaveURL(/\/sign-in/)
    await page.goto('/workspace')
    await expect(page).toHaveURL(/\/sign-in\?redirect=/)
  })

  test('restores the session across a full page reload', async ({ page }) => {
    await signIn(page)
    await expect(page).toHaveURL(/\/workspace$/)

    // 令牌只存在 cookie 里，重载后由 auth.client.ts 的 bootstrap 恢复
    await page.reload()
    await expect(page).toHaveURL(/\/workspace$/)
    await expect(page.locator('.workspace-card__title')).toHaveText('Quarterly plan')
  })

  test('redirects localized product URLs to the language-neutral canonical path', async ({
    page
  }) => {
    await signIn(page)
    await page.goto('/en/workspace')

    await expect(page).toHaveURL(`${APP_ORIGIN}/workspace`)
  })

  test('keeps the public header anonymous for cache safety while signed in', async ({ page }) => {
    await signIn(page)
    await page.goto('/pricing')

    // 客户端渲染后应显示进入工作台的 CTA
    await expect(page.locator('.app-header__workspace')).toBeVisible()

    // 但服务端返回的 HTML（缓存的那一份）必须是匿名形态
    const html = await (await page.request.get('/pricing')).text()
    expect(html).toContain('app-header__sign-in')
    expect(html).not.toContain('app-header__workspace')
  })

  test('signs out from the user menu and returns to the public home page', async ({ page }) => {
    await signIn(page)
    await page.goto('/account')

    await waitForHydration(page)
    await page.locator('.user-account-menu__trigger').click()
    // 账户页正文里也有一个「退出登录」按钮，必须限定在用户菜单内，否则命中两个元素
    await page
      .locator('.user-account-menu__flyout')
      .getByText(/退出登录|Sign out/i)
      .click()

    await expect(page).toHaveURL(`${APP_ORIGIN}/`)
    await page.goto('/workspace')
    await expect(page).toHaveURL(/\/sign-in\?redirect=/)
  })
})
