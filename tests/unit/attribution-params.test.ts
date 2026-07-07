/*
  【文件职责】
    单测：归因参数 last-touch 按 key 合并、localStorage 读写、mergeAttributionIntoBody。

  【架构位置】
    tests/unit — @vitest-environment happy-dom，mock localStorage。

  【主要导出 / 路由】
    describe attribution params

  【依赖关系】
    - 依赖：app/utils/attribution-params.ts
    - mock：global localStorage Map

  【渲染 / 数据】
    happy-dom

  【边界与注意】
    不覆盖 attribution.client plugin 路由监听；SSR 分支为 no-op 不测浏览器。
*/
// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from 'vitest'
import {
  ATTRIBUTION_STORAGE_KEY,
  clearAttributionParams,
  getAttributionParams,
  mergeAttributionIntoBody,
  saveAttributionParams
} from '../../app/utils/attribution-params'

const storage = new Map<string, string>()

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      storage.set(key, value)
    },
    removeItem: (key: string) => {
      storage.delete(key)
    }
  }
})

afterEach(() => {
  storage.clear()
})

describe('attribution params', () => {
  it('saves utm params from query', () => {
    saveAttributionParams({ utm_source: 'test' })
    expect(getAttributionParams()).toEqual({ utm_source: 'test' })
  })

  it('merges attribution params by key without clearing untouched keys', () => {
    saveAttributionParams({ utm_source: 'a', utm_medium: 'cpc' })
    saveAttributionParams({ gclid: 'b' })

    expect(getAttributionParams()).toEqual({
      utm_source: 'a',
      utm_medium: 'cpc',
      gclid: 'b'
    })
  })

  it('overwrites only keys present in the latest query', () => {
    saveAttributionParams({ utm_source: 'a' })
    saveAttributionParams({ utm_source: 'ad' })

    expect(getAttributionParams()).toEqual({ utm_source: 'ad' })
  })

  it('stores standalone gclid and fbclid params', () => {
    saveAttributionParams({ gclid: 'abc' })
    expect(getAttributionParams()).toEqual({ gclid: 'abc' })

    clearAttributionParams()
    saveAttributionParams({ fbclid: 'meta-click' })
    expect(getAttributionParams()).toEqual({ fbclid: 'meta-click' })
  })

  it('ignores empty query and non-attribution query keys', () => {
    saveAttributionParams({})
    saveAttributionParams({ redirect: '/pricing' })

    expect(getAttributionParams()).toEqual({})
    expect(localStorage.getItem(ATTRIBUTION_STORAGE_KEY)).toBeNull()
  })

  it('normalizes array query values to the first string entry', () => {
    saveAttributionParams({ utm_source: ['first', 'second'] })
    expect(getAttributionParams()).toEqual({ utm_source: 'first' })
  })

  it('ignores null, undefined, and object query values', () => {
    saveAttributionParams({
      utm_source: null,
      utm_medium: undefined,
      gclid: { id: 'bad' }
    })

    expect(getAttributionParams()).toEqual({})
  })

  it('merges stored attribution into request body with body taking precedence', () => {
    saveAttributionParams({ utm_source: 'ad', gclid: 'abc' })

    expect(
      mergeAttributionIntoBody({
        username: 'demo',
        password: 'secret',
        utm_source: 'override'
      })
    ).toEqual({
      utm_source: 'override',
      gclid: 'abc',
      username: 'demo',
      password: 'secret'
    })
  })

  it('clears stored attribution params', () => {
    saveAttributionParams({ utm_source: 'test' })
    clearAttributionParams()
    expect(getAttributionParams()).toEqual({})
  })
})
