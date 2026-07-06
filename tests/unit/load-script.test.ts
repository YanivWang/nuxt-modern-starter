// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { loadExternalScript } from '../../app/utils/load-script'

describe('loadExternalScript', () => {
  let createdScripts: HTMLScriptElement[]

  beforeEach(() => {
    vi.useFakeTimers()
    createdScripts = []
    document.head.innerHTML = ''

    vi.spyOn(document.head, 'appendChild').mockImplementation((node) => {
      if (node instanceof HTMLScriptElement) {
        createdScripts.push(node)
      }

      return node
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
    document.head.innerHTML = ''
  })

  it('appends a script after the default defer delay', async () => {
    const promise = loadExternalScript('https://example.com/analytics.js')

    expect(createdScripts).toHaveLength(0)

    await vi.advanceTimersByTimeAsync(3000)

    expect(createdScripts).toHaveLength(1)
    expect(createdScripts[0]?.src).toBe('https://example.com/analytics.js')
    expect(createdScripts[0]?.async).toBe(true)

    createdScripts[0]?.onload?.(new Event('load'))
    await expect(promise).resolves.toBeUndefined()
  })

  it('uses the provided defer delay', async () => {
    const promise = loadExternalScript('https://example.com/analytics.js', 1500)

    await vi.advanceTimersByTimeAsync(1499)
    expect(createdScripts).toHaveLength(0)

    await vi.advanceTimersByTimeAsync(1)
    expect(createdScripts).toHaveLength(1)

    createdScripts[0]?.onload?.(new Event('load'))
    await expect(promise).resolves.toBeUndefined()
  })

  it('skips duplicate script injection for the same src', async () => {
    vi.spyOn(document, 'querySelector').mockReturnValue(document.createElement('script'))

    const promise = loadExternalScript('https://example.com/analytics.js', 0)
    await vi.advanceTimersByTimeAsync(0)

    expect(createdScripts).toHaveLength(0)
    await expect(promise).resolves.toBeUndefined()
  })

  it('rejects when script loading fails', async () => {
    const promise = loadExternalScript('https://example.com/analytics.js', 0)
    await vi.advanceTimersByTimeAsync(0)

    createdScripts[0]?.onerror?.(new Event('error'))
    await expect(promise).rejects.toThrow('Failed to load script: https://example.com/analytics.js')
  })

  it('falls back to 3000ms when deferMs is invalid', async () => {
    const promise = loadExternalScript('https://example.com/analytics.js', Number.NaN)

    await vi.advanceTimersByTimeAsync(2999)
    expect(createdScripts).toHaveLength(0)

    await vi.advanceTimersByTimeAsync(1)
    expect(createdScripts).toHaveLength(1)

    createdScripts[0]?.onload?.(new Event('load'))
    await expect(promise).resolves.toBeUndefined()
  })
})
