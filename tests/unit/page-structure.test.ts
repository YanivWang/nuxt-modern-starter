import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const projectRoot = resolve(__dirname, '../..')
const productPageFiles = [
  'app/pages/account.vue',
  'app/pages/docs/[id].vue',
  'app/pages/workspace/index.vue',
  'app/pages/workspace/templates/index.vue'
]

describe('page directory boundaries', () => {
  it('keeps product pages outside localized public page routes', () => {
    expect(existsSync(resolve(projectRoot, 'app/pages/workspace/index.vue'))).toBe(true)
    expect(existsSync(resolve(projectRoot, 'app/pages/docs/[id].vue'))).toBe(true)
    expect(existsSync(resolve(projectRoot, 'app/pages/account.vue'))).toBe(true)
  })

  it('keeps product page imports rooted at the app aliases', () => {
    for (const file of productPageFiles) {
      const source = readFileSync(resolve(projectRoot, file), 'utf8')

      expect(source, file).not.toMatch(/from ['"](?:\.\.\/)+(?:features|api)\//)
      expect(source, file).not.toMatch(/from ['"](?:\.\.\/)+config\//)
    }
  })
})
