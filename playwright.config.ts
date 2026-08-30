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
    改端口须同步 .env.e2e 的 NUXT_PUBLIC_SITE_URL / NUXT_PUBLIC_API_BASE 与 tests/e2e/support.ts。
    端口刻意避开 3000 / 3100 / 2027 这些常用值：开发机上同时跑好几个项目是常态，
    撞端口会直接让整轮 E2E 失去意义。被占用时可用 E2E_APP_PORT / STUB_API_PORT 覆盖。
    reuseExistingServer 一律关闭：pnpm test:e2e 每次都会重新构建，
    复用一个恰好占着端口的旧服务，跑的就是那个旧服务的行为 —— 会表现为大面积莫名失败。
    关掉之后，端口被占会是一条明确的报错，而不是一堆看不懂的断言失败。
*/
import { defineConfig, devices } from '@playwright/test'

const APP_PORT = Number(process.env.E2E_APP_PORT || 3399)
const STUB_API_PORT = Number(process.env.STUB_API_PORT || 2127)
const baseURL = `http://127.0.0.1:${APP_PORT}`

export default defineConfig({
  testDir: 'tests/e2e/specs',
  // 端到端断言依赖网络与真实渲染，给的余量比单测大
  timeout: 60_000,
  expect: { timeout: 10_000 },
  // 桩后端是单进程全局状态（POST /api/__reset 会重置所有用例共享的数据），
  // 并行跑会让一个用例的 seed 覆盖另一个用例的前置条件 —— 表现为每次挂的用例都不一样。
  // 要恢复并行，得先让桩状态按用例隔离（例如按请求头分租户）。
  fullyParallel: false,
  // CI 上禁止 test.only 混入
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: 1,
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
      url: `http://127.0.0.1:${STUB_API_PORT}/api/v1/content/news`,
      reuseExistingServer: false,
      timeout: 30_000,
      env: { STUB_API_PORT: String(STUB_API_PORT) }
    },
    {
      // preview 服务 .output，因此必须先 pnpm build:e2e（pnpm test:e2e 已串好）
      command: `corepack pnpm exec nuxt preview --dotenv .env.e2e --port ${APP_PORT}`,
      url: baseURL,
      reuseExistingServer: false,
      timeout: 120_000
    }
  ]
})
