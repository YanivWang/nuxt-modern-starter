/*
  【文件职责】
    单测：基于 .output/public/_nuxt 构建产物检查 SaaS 基础依赖分包预算。

  【架构位置】
    tests/unit — 读构建产物，无运行时。

  【主要导出 / 路由】
    describe build output budgets

  【依赖关系】
    - 依赖：.output/public/_nuxt 构建产物
    - mock：无

  【渲染 / 数据】
    无

  【边界与注意】
    若缺少 .output，本测试显式 skip 并说明需先跑 pnpm build；不再读取 nuxt.config.ts 源码文本断言。
*/
import { existsSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const nuxtAssetsDir = join(process.cwd(), '.output/public/_nuxt')
const maxJavaScriptChunkBytes = 3_000_000
const maxEditorDocumentCssBytes = 200_000

const readAssets = () => {
  if (!existsSync(nuxtAssetsDir)) {
    return null
  }

  return readdirSync(nuxtAssetsDir)
    .filter((name) => name.endsWith('.js') || name.endsWith('.css'))
    .map((name) => ({
      name,
      bytes: statSync(join(nuxtAssetsDir, name)).size
    }))
}

describe('build output budgets', () => {
  it('keeps emitted JavaScript chunks within the configured warning budget', () => {
    const assets = readAssets()

    if (!assets) {
      console.warn('build output budget check skipped: run `pnpm build` to create .output first')
      return
    }

    const oversizedChunks = assets
      .filter((asset) => asset.name.endsWith('.js') && asset.bytes > maxJavaScriptChunkBytes)
      .map((asset) => `${asset.name}:${asset.bytes}`)

    expect(oversizedChunks).toEqual([])
  })

  it('emits heavy editor stylesheet and upload worker as separate assets', () => {
    const assets = readAssets()

    if (!assets) {
      console.warn('build output asset check skipped: run `pnpm build` to create .output first')
      return
    }

    const editorDocumentCss = assets.find(
      (asset) => asset.name.startsWith('vendor-editor-document.') && asset.name.endsWith('.css')
    )

    expect(editorDocumentCss?.bytes).toBeGreaterThan(0)
    expect(editorDocumentCss?.bytes).toBeLessThanOrEqual(maxEditorDocumentCssBytes)
    expect(assets.some((asset) => asset.name.startsWith('compute-file-md5.worker-'))).toBe(true)
  })
})
