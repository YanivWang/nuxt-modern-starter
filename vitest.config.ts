/*
  【文件职责】
    Vitest 配置：默认 happy-dom 环境 + 按文件 opt-in 的 Nuxt 环境、hook 超时、覆盖率采集与阈值。
    tests/e2e 由 Playwright 独立运行，不在本配置的 include 范围内。

  【架构位置】
    根配置 — 与 nuxt.config 协同，测试时注入 @nuxt/test-utils/module。

  【主要导出 / 路由】
    defineVitestConfig default export

  【依赖关系】
    - 依赖：@nuxt/test-utils/config、@vitest/coverage-v8
    - 被引用：pnpm test / pnpm test:watch / pnpm test:coverage、pnpm quality、CI quality.yml
      （Husky pre-commit 只跑 lint-staged，不跑 vitest）

  【渲染 / 数据】
    默认 environment: happy-dom；需要 Nuxt 运行时（useRuntimeConfig / useCookie / useAsyncData 等
    自动导入）的文件在首行写 `// @vitest-environment nuxt` 单独 opt-in。
    globals: true。

  【边界与注意】
    hookTimeout 必须显式放宽：@nuxt/test-utils 的 setupNuxt() 跑在 beforeAll 里，
    冷启动远超 Vitest 默认 10s，用默认值会让整个文件以 "Hook timed out" 失败并跳过其中所有用例。
    覆盖率阈值是「棘轮基线」——只允许调高，不允许为了让 CI 变绿而调低。
    include 仅 tests/；E2E 见 playwright.config.ts。
*/
import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    // 绝大多数用例是纯函数 / Vue 响应式 / 读盘断言，不需要整个 Nuxt 运行时。
    // 需要的文件用 `// @vitest-environment nuxt` 逐个 opt-in，避免 38 个文件都付启动成本。
    environment: 'happy-dom',
    globals: true,
    // 仅扫描 tests/；E2E 由 Playwright 跑，见 playwright.config.ts
    include: ['tests/**/*.{test,spec}.ts'],
    exclude: ['tests/e2e/**', 'node_modules/**'],
    // setupNuxt() 在 beforeAll 中构建 Nuxt 实例，冷启动可达数十秒；默认 10s 会误报超时。
    hookTimeout: 60_000,
    testTimeout: 20_000,
    // 每个 nuxt 环境文件都会在自己的 worker 里构建一个完整 Nuxt 实例。
    // 放开默认并行度（cpus-1）会让十几个实例同时抢 CPU，把本来 1s 的纯函数用例饿到超时 ——
    // 表现为「单独跑全绿、跑全量随机挂几个」。上限拿掉前先确认全量套件仍稳定。
    maxWorkers: 6,
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'json-summary', 'lcov'],
      reportsDirectory: 'coverage',
      include: ['app/**/*.ts', 'app/**/*.vue', 'server/**/*.ts', 'config/**/*.ts', 'i18n/**/*.ts'],
      exclude: [
        // 类型声明与纯类型模块没有可执行语句，计入分母只会稀释信号
        'app/shims.d.ts',
        'app/types/**',
        'app/lib/http/types.ts',
        'app/features/editor/upload/types.ts',
        // Worker 在独立线程里执行，v8 provider 采不到
        'app/features/editor/upload/compute-file-md5.worker.ts'
      ],
      // 棘轮基线：由实测值向下取整而来，只升不降。
      // 全局值被 .vue（组件 / 页面）拉低是预期内的 —— 渲染路径由 tests/component 与
      // tests/e2e 覆盖，后者不计入 v8 覆盖率。纯逻辑层单独设高阈值，防止真正该测的代码退化。
      thresholds: {
        lines: 55,
        functions: 45,
        branches: 45,
        statements: 55,
        'app/lib/http/**': { lines: 95, functions: 95, branches: 85, statements: 95 },
        'app/utils/**': { lines: 85, functions: 88, branches: 78, statements: 85 },
        'app/api/**': { lines: 80, functions: 58, branches: 38, statements: 78 },
        'app/stores/**': { lines: 80, functions: 65, branches: 58, statements: 80 },
        'app/middleware/**': { lines: 75, functions: 82, branches: 70, statements: 74 },
        'config/**': { lines: 88, functions: 93, branches: 80, statements: 90 },
        'server/utils/**': { lines: 85, functions: 88, branches: 60, statements: 85 }
      }
    }
  }
})
