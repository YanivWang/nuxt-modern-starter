import { describe, expect, it } from 'vitest'

describe('starter smoke test', () => {
  it('has a working Nuxt test environment', () => {
    expect(useRuntimeConfig().public.siteUrl).toBeTruthy()
  })
})
