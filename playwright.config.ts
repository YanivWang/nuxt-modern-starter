/*
  【文件职责】
    Playwright E2E 配置：同时拉起桩后端与 Nitro preview 服务，跑 tests/e2e/specs。

  【架构位置】
    根配置 — 与 vitest.config.ts 分工：Vitest 管单元 / 组件层，Playwright 管真实浏览器端到端。

  【主要导出 / 路由】
    defineConfig default export

  【依赖关系】
    - 依赖：tests/e2e/stub-api/server.mjs、.env.e2e、.output（须先 pnpm build:e2e）
    - 被引用：pnpm test:e2e / pnpm test:e2e:only、CI e2e job

  【渲染 / 数据】
    对 .output 里的生产构建跑测试，而不是 dev server —— prerender / SWR / CSR 的
    路由分区只有在真实构建产物上才成立。

  【边界与注意】
    webServer 顺序无关，Playwright 会并行等待两个端口就绪。
    改端口须同步 .env.e2e 的 NUXT_PUBLIC_API_BASE 与 STUB_API_PORT。
*/
import { defineConfig, devices } from '@playwright/test'

const APP_PORT = Number(process.env.E2E_APP_PORT || 3000)
const STUB_API_PORT = Number(process.env.STUB_API_PORT || 2027)
const baseURL = `http://127.0.0.1:${APP_PORT}`

export default defineConfig({
  testDir: 'tests/e2e/specs',
  // 端到端断言依赖网络与真实渲染，给的余量比单测大
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  // CI 上禁止 test.only 混入
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  webServer: [
    {
      command: 'node tests/e2e/stub-api/server.mjs',
      url: `http://127.0.0.1:${STUB_API_PORT}/api/content/news`,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
      env: { STUB_API_PORT: String(STUB_API_PORT) }
    },
    {
      // preview 服务 .output，因此必须先 pnpm build:e2e（pnpm test:e2e 已串好）
      command: `corepack pnpm exec nuxt preview --dotenv .env.e2e --port ${APP_PORT}`,
      url: baseURL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000
    }
  ]
})
