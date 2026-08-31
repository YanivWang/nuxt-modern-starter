/*
  【文件职责】
    单测：pushSafely 对 router.push 的两种结局都不向外抛。

  【架构位置】
    tests/unit — 纯函数，用假 router 断言，无 Nuxt 运行时。

  【主要导出 / 路由】
    describe pushSafely、describe replaceSafely

  【依赖关系】
    - 依赖：app/utils/navigate-safely.ts
    - mock：假 router（只需要 push）

  【渲染 / 数据】
    无

  【边界与注意】
    这条测试守的是「不冒泡」这个契约本身：一旦有人把 try/catch 去掉，
    路由 guard 抛出的错误会重新变成没人接的 unhandled rejection，
    而那种问题只在跑全量时偶发，很难靠复现定位。
*/
import { describe, expect, it, vi } from 'vitest'
import type { Router } from 'vue-router'
import { pushSafely, replaceSafely } from '../../app/utils/navigate-safely'

const fakeRouter = (navigate: Router['push']) =>
  ({ push: navigate, replace: navigate }) as unknown as Router

describe('pushSafely', () => {
  it('forwards the target to router.push on the happy path', async () => {
    const push = vi.fn().mockResolvedValue(undefined)

    await expect(pushSafely(fakeRouter(push), '/en')).resolves.toBeUndefined()
    expect(push).toHaveBeenCalledWith('/en')
  })

  it('swallows a rejected navigation instead of letting it escape', async () => {
    // 路由 middleware 抛错时 Nuxt 已经 showError 渲染过错误页，
    // push() 的这次 reject 是重复的一份，冒出去只会变成 unhandled rejection
    const push = vi.fn().mockRejectedValue(new Error('unsupported language'))

    await expect(pushSafely(fakeRouter(push), '/xx')).resolves.toBeUndefined()
  })

  it('swallows a non-Error rejection just the same', async () => {
    const push = vi.fn().mockRejectedValue('nope')

    await expect(pushSafely(fakeRouter(push), '/en')).resolves.toBeUndefined()
  })
})

describe('replaceSafely', () => {
  it('forwards the target to router.replace on the happy path', async () => {
    const replace = vi.fn().mockResolvedValue(undefined)

    await expect(replaceSafely(fakeRouter(replace), '/docs/1')).resolves.toBeUndefined()
    expect(replace).toHaveBeenCalledWith('/docs/1')
  })

  it('swallows a rejected replace as well', async () => {
    // 草稿页换成真实文档页时用 replace；它由自动保存链路触发，同样没人接 rejection
    const replace = vi.fn().mockRejectedValue(new Error('aborted'))

    await expect(replaceSafely(fakeRouter(replace), '/docs/1')).resolves.toBeUndefined()
  })
})
