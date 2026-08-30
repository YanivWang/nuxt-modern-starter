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
    //
    // CI 上再收紧一档：GitHub 托管 runner 只有 2 核，而 test job 跑的是带插桩的
    // test:coverage，开销比本地更大。按 6 个 worker 会超额订阅三倍，
    // 同样会把纯函数用例饿到 20s 超时。
    maxWorkers: process.env.CI ? 2 : 6,
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
        'app/features/editor/upload/compute-file-md5.worker.ts',
        // Nitro 的插件 / 中间件 / 路由入口只在真实服务进程里执行，Vitest 永远跑不到它们。
        // 本项目刻意把逻辑下沉到 server/utils 与 config（两者阈值都很高），入口只剩接线，
        // 行为由 tests/e2e 验证（healthz / readyz / 301 / 安全响应头都有断言）。
        // 把它们算进分母只会用一堆恒为 0% 的薄文件稀释信号；
        // 顺带也绕开 v8 provider 对「未被加载的 TS 文件」用 JS 解析器解析导致的 PARSE_ERROR。
        'server/plugins/**',
        'server/middleware/**',
        'server/routes/**'
      ],
      // 棘轮基线：由实测值向下取整而来，只升不降。
      // 全局值被 .vue（组件 / 页面）拉低是预期内的 —— 渲染路径由 tests/component 与
      // tests/e2e 覆盖，后者不计入 v8 覆盖率。纯逻辑层单独设高阈值，防止真正该测的代码退化。
      thresholds: {
        // 全局值被 .vue（组件 / 页面）拉低是预期内的：渲染路径由 tests/component 与
        // tests/e2e 覆盖，而 E2E 不计入 v8 覆盖率。
        lines: 55,
        functions: 48,
        branches: 49,
        statements: 54,
        // 纯逻辑层单独设高阈值 —— 真正该测的代码退化必须立刻报出来。
        // 数值取自实测值下浮 2~3 个点：既能挡住退化，又不会被无关重构的小幅波动误伤。
        'app/lib/http/**': { lines: 93, functions: 93, branches: 85, statements: 93 },
        'app/utils/**': { lines: 91, functions: 95, branches: 85, statements: 91 },
        'app/api/**': { lines: 82, functions: 60, branches: 58, statements: 79 },
        'app/stores/**': { lines: 90, functions: 78, branches: 57, statements: 89 },
        'app/middleware/**': { lines: 74, functions: 78, branches: 70, statements: 72 },
        'app/composables/**': { lines: 80, functions: 68, branches: 65, statements: 79 },
        'config/**': { lines: 95, functions: 95, branches: 87, statements: 95 },
        'server/utils/**': { lines: 89, functions: 91, branches: 76, statements: 89 }
      }
    }
  }
})
