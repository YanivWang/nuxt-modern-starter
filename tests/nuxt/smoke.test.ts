/*
  【文件职责】
    Nuxt 环境冒烟：确认 @nuxt/test-utils vitest 可读取 runtimeConfig。

  【架构位置】
    tests/nuxt — environment: nuxt（vitest.config）。

  【主要导出 / 路由】
    describe starter smoke test

  【依赖关系】
    - 依赖：nuxt.config runtimeConfig.public
    - mock：无

  【渲染 / 数据】
    Nuxt test environment

  【边界与注意】
    不覆盖页面渲染 E2E；仅 sanity check。
*/
import { describe, expect, it } from 'vitest'

describe('starter smoke test', () => {
  it('has a working Nuxt test environment', () => {
    expect(useRuntimeConfig().public.siteUrl).toBeTruthy()
    expect(useRuntimeConfig().public.appEnv).toBe('test')
  })
})
