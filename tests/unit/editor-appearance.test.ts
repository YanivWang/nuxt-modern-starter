/*
  【文件职责】
    契约测试：editorCustomAppearanceVars 里的每个 --ye-* 都必须是已安装的
    @yanivjs/yaniv-editor 真正读取的变量。

  【架构位置】
    tests/unit — 读 node_modules 里编辑器的 CSS 产物，无需 Nuxt 运行时。

  【主要导出 / 路由】
    describe editor appearance contract

  【依赖关系】
    - 依赖：app/features/editor/editor-appearance.ts、node_modules/@yanivjs/yaniv-editor/dist/*.css
    - mock：无

  【渲染 / 数据】
    无

  【边界与注意】
    🔴 设一个库里不存在的变量名不会报错，也不会有任何效果 —— 它只是一条永远不生效的样式声明。
    升级编辑器时若某个变量被改名，这里就会静默失效，页面上表现为「某块颜色忽然不跟主题了」，
    而没有任何测试或类型能发现。0.3.0 升级后确实留下过 7 条这样的死映射。

    反向（库有、我们没映射）不作断言：库的变量远多于站点需要接管的，
    未映射的会落到库自带调色板，那是可接受的默认值，不是缺陷。
*/
import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { editorCustomAppearanceVars } from '../../app/features/editor/editor-appearance'

const editorDistDir = resolve(__dirname, '../../node_modules/@yanivjs/yaniv-editor/dist')

/** 已安装版本的样式里出现过的全部 --ye-* 变量（定义与引用都算） */
const libraryVars = (() => {
  const css = readdirSync(editorDistDir)
    .filter((file) => file.endsWith('.css'))
    .map((file) => readFileSync(resolve(editorDistDir, file), 'utf8'))
    .join('\n')

  return new Set([...css.matchAll(/--ye-[a-z0-9-]+/g)].map((match) => match[0]))
})()

describe('editor appearance contract', () => {
  it('reads a stylesheet that actually declares --ye-* variables', () => {
    // 防止 dist 结构变化导致上面扫出空集合，让下面那条断言变成永远通过
    expect(libraryVars.size).toBeGreaterThan(50)
  })

  it('maps only variables the installed editor really consumes', () => {
    const dead = Object.keys(editorCustomAppearanceVars).filter((name) => !libraryVars.has(name))

    expect(dead, '这些变量在已安装的编辑器里不存在，设了不会有任何效果').toEqual([])
  })

  it('points every mapping at an app design token', () => {
    // 直接写死色值会绕开主题切换：站点切暗色时编辑器不会跟随
    const literal = Object.entries(editorCustomAppearanceVars).filter(
      ([, value]) => !value.startsWith('var(--app-') && value !== 'transparent'
    )

    expect(literal, '外观变量应引用 --app-* token，而不是写死色值').toEqual([])
  })
})
