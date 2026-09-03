/*
  【文件职责】
    E2E 共享常量与动作：应用 / 桩后端的 origin、桩状态重置、登录。
    origin 集中在这里，避免各 spec 硬编码端口 —— 端口一改就要满仓库找替换。

  【架构位置】
    tests/e2e — 被 tests/e2e/specs/*.spec.ts 引用；Playwright 只收集 *.spec.ts，本文件不会被当成用例。

  【主要导出 / 路由】
    APP_ORIGIN、STUB_API_ORIGIN、CREDENTIALS、resetStub、signIn

  【依赖关系】
    - 依赖：@playwright/test、.env.e2e（须与此处端口一致）
    - 被引用：tests/e2e/specs/*.spec.ts

  【边界与注意】
    端口刻意避开 3000 / 3100 / 2027 这些常用值：开发机上同时跑好几个项目是常态。
    被占用时只需设 E2E_APP_PORT / STUB_API_PORT：本文件与 playwright.config.ts 都读它们，
    而 playwright 会把对应的 siteUrl / apiBase 注入 preview 进程覆盖 .env.e2e 的默认值。
    Playwright 的 reuseExistingServer 一旦复用了别人的服务，跑出来的是那个服务的行为，
    表现为大面积莫名失败（连 robots.txt 都对不上）。改端口须同步 .env.e2e 与 playwright.config.ts。
*/
import { expect, type APIRequestContext, type Page } from '@playwright/test'

const APP_PORT = Number(process.env.E2E_APP_PORT || 3399)
const STUB_API_PORT = Number(process.env.STUB_API_PORT || 2127)

export const APP_ORIGIN = `http://127.0.0.1:${APP_PORT}`
/** 含版本前缀；与后端 API_VERSION_PREFIX 及 .env.e2e 的 NUXT_PUBLIC_API_BASE 一致 */
export const STUB_API_ORIGIN = `http://127.0.0.1:${STUB_API_PORT}/api/v1`

export const CREDENTIALS = { username: 'alice', password: 'correct-horse' }

/**
 * 等 Vue 完成水合再交互。
 *
 * /sign-in 是 SSR 页面：表单在 HTML 里就已存在，水合完成前点提交只会触发原生表单提交，
 * 点了等于没点，测试随机停在 /sign-in。Vue 在 app.mount() 时给根容器挂 __vue_app__，
 * 用它作为「客户端已接管」的判据。
 */
export const waitForHydration = (page: Page) =>
  page.waitForFunction(() => {
    const root = document.getElementById('__nuxt') as
      (HTMLElement & { __vue_app__?: unknown }) | null
    return Boolean(root?.__vue_app__)
  })

/** 重置桩后端到确定性初始状态；projects 可指定生成的项目条数 */
export const resetStub = (request: APIRequestContext, projects = 1) =>
  request.post(`${STUB_API_ORIGIN}/__reset`, { data: { projects } })

/**
 * 走真实登录表单，落到 /workspace。
 *
 * 提交按钮用 form 内的 submit 定位，不要按可访问名匹配文案：
 * Ant Design Vue 会在两个汉字之间插入空格（「登录」实际渲染成「登 录」），
 * 而且顶栏还有一个同名的「登录」链接，按名字匹配既不稳也有歧义。
 */
export const signIn = async (page: Page, target = '/sign-in') => {
  await page.goto(target)
  await waitForHydration(page)
  await page.locator('input[autocomplete="username"]').fill(CREDENTIALS.username)
  await page.locator('input[autocomplete="current-password"]').fill(CREDENTIALS.password)
  await page.locator('form button[type="submit"]').click()
}

/** 登录并确认已进入工作台，供以工作台为起点的用例复用 */
export const signInToWorkspace = async (page: Page) => {
  await signIn(page)
  await expect(page).toHaveURL(/\/workspace$/)
}
