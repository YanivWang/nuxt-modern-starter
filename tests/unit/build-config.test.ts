import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const readNuxtConfig = () => readFile(join(process.cwd(), 'nuxt.config.ts'), 'utf8')

describe('build config', () => {
  it('keeps vendor chunk ownership explicit for heavy SaaS foundation dependencies', async () => {
    const source = await readNuxtConfig()

    expect(source).toContain('const resolveVendorChunk')
    expect(source).toContain('chunkSizeWarningLimit: 3000')
    expect(source).toContain('manualChunks: resolveVendorChunk')
    expect(source).toContain('vendor-ant-design')
    expect(source).toContain('vendor-editor-document')
    expect(source).toContain('vendor-vue')
  })
})
