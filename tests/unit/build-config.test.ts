/*
  【文件职责】
    单测：基于 .output 构建产物校验 manualChunks 分包实际生效与体积预算。
    断言 4 个 vendor chunk 真实产出（读 client manifest），而非读 nuxt.config.ts 源码文本。

  【架构位置】
    tests/unit — 读构建产物，无运行时。

  【主要导出 / 路由】
    describe build output budgets

  【依赖关系】
    - 依赖：.output/public/_nuxt 资产、.output/server/chunks/build/client.precomputed.mjs（chunk 名映射）
    - mock：无

  【渲染 / 数据】
    无

  【边界与注意】
    JS chunk 文件名只含 hash 不含 chunk 名，故 vendor 分包只能从 client manifest 的 name 字段校验。
    缺少 .output 时 ctx.skip() 显式跳过（不是静默 return）；pnpm quality 已保证 build 在 test 之前。
*/
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const outputDir = join(process.cwd(), '.output')
const nuxtAssetsDir = join(outputDir, 'public/_nuxt')
const clientManifestFile = join(outputDir, 'server/chunks/build/client.precomputed.mjs')

const maxJavaScriptChunkBytes = 3_000_000
const maxEditorDocumentCssBytes = 200_000

// nuxt.config.ts::resolveVendorChunk 显式声明的分包，每一个都必须在产物中真实出现
const requiredVendorChunks = [
  'vendor-ant-design',
  'vendor-editor-document',
  'vendor-vue',
  'vendor-upload'
] as const

const readAssets = () =>
  readdirSync(nuxtAssetsDir)
    .filter((name) => name.endsWith('.js') || name.endsWith('.css'))
    .map((name) => ({ name, bytes: statSync(join(nuxtAssetsDir, name)).size }))

// JS 产物文件名只有 hash，chunk 名仅存在于 client manifest 的 name 字段
const readEmittedChunkNames = () => {
  const source = readFileSync(clientManifestFile, 'utf8')
  return new Set([...source.matchAll(/name:\s*"([^"]+)"/g)].map((match) => match[1]))
}

describe('build output budgets', () => {
  it('emits every explicitly declared vendor chunk', (ctx) => {
    if (!existsSync(clientManifestFile)) {
      ctx.skip()
      return
    }

    const emitted = readEmittedChunkNames()
    const missing = requiredVendorChunks.filter((chunk) => !emitted.has(chunk))

    expect(missing, 'manualChunks 声明的分包未出现在产物中').toEqual([])
  })

  it('keeps emitted JavaScript chunks within the configured warning budget', (ctx) => {
    if (!existsSync(nuxtAssetsDir)) {
      ctx.skip()
      return
    }

    const oversizedChunks = readAssets()
      .filter((asset) => asset.name.endsWith('.js') && asset.bytes > maxJavaScriptChunkBytes)
      .map((asset) => `${asset.name}:${asset.bytes}`)

    expect(oversizedChunks).toEqual([])
  })

  it('emits heavy editor stylesheet and upload worker as separate assets', (ctx) => {
    if (!existsSync(nuxtAssetsDir)) {
      ctx.skip()
      return
    }

    const assets = readAssets()
    const editorDocumentCss = assets.find(
      (asset) => asset.name.startsWith('vendor-editor-document.') && asset.name.endsWith('.css')
    )

    expect(editorDocumentCss?.bytes).toBeGreaterThan(0)
    expect(editorDocumentCss?.bytes).toBeLessThanOrEqual(maxEditorDocumentCssBytes)
    expect(assets.some((asset) => asset.name.startsWith('compute-file-md5.worker-'))).toBe(true)
  })
})
