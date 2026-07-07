/*
  【文件职责】
    Vitest 配置：Nuxt test environment，扫描 tests 下所有 .test.ts。

  【架构位置】
    根配置 — 与 nuxt.config 协同，测试时注入 @nuxt/test-utils/module。

  【主要导出 / 路由】
    defineVitestConfig default export

  【依赖关系】
    - 依赖：@nuxt/test-utils/config
    - 被引用：pnpm test、Husky pre-commit

  【渲染 / 数据】
    environment: nuxt；globals: true。

  【边界与注意】
    include 仅 tests 目录；E2E 不在此配置范围。
*/
import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    globals: true,
    include: ['tests/**/*.{test,spec}.ts']
  }
})
