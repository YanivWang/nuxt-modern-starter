import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const projectRoot = resolve(__dirname, '../..')
const productPageFiles = [
  'app/pages/app/account.vue',
  'app/pages/app/editor.vue',
  'app/pages/app/workspace/index.vue',
  'app/pages/app/workspace/[projectId]/edit.vue',
  'app/pages/app/workspace/[projectId]/preview.vue'
]

describe('page directory boundaries', () => {
  it('keeps product pages outside localized public page routes', () => {
    expect(existsSync(resolve(projectRoot, 'app/pages/app/workspace/index.vue'))).toBe(true)
    expect(existsSync(resolve(projectRoot, 'app/pages/[[language]]/app'))).toBe(false)
  })

  it('keeps moved product page imports rooted at the app aliases', () => {
    for (const file of productPageFiles) {
      const source = readFileSync(resolve(projectRoot, file), 'utf8')

      expect(source, file).not.toMatch(/from ['"](?:\.\.\/)+(?:features|apis)\//)
      expect(source, file).not.toMatch(/from ['"](?:\.\.\/)+config\//)
    }
  })
})
