/*
  【文件职责】
    dependency-cruiser 规则：用真实模块依赖图强制架构边界（循环依赖、feature 隔离、
    页面只用 barrel、config / i18n 作为叶子层、server 不依赖 UI 层）。

  【架构位置】
    根配置 — 与 tests/unit/page-structure.test.ts 分工：
    那里用正则扫源码文本，这里解析真实依赖图，能抓到 re-export 链与传递依赖。

  【边界与注意】
    ~ / @ 别名必须显式声明：Nuxt 把 srcDir 设成 app/，不声明的话 `~/features/...`
    会停留在未解析状态，所有基于路径的规则都会静默失效（看起来全绿，实际什么都没查）。
*/
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      comment: '循环依赖会让模块初始化顺序变得不可预测，也让重构无从下手。',
      severity: 'error',
      from: {},
      to: { circular: true }
    },
    {
      name: 'no-cross-feature',
      comment:
        'feature 之间不得互相 import。需要共享的东西上移到 app/api、app/types、app/composables。',
      severity: 'error',
      from: { path: '^app/features/([^/]+)/' },
      to: {
        path: '^app/features/([^/]+)/',
        pathNot: '^app/features/$1/'
      }
    },
    {
      name: 'pages-use-feature-barrels',
      comment:
        '页面只能 import feature 的 barrel（app/features/<name>/index.ts），不得深引内部实现。',
      severity: 'error',
      from: { path: '^app/pages/' },
      to: {
        path: '^app/features/[^/]+/.+',
        pathNot: '^app/features/[^/]+/index\\.ts$'
      }
    },
    {
      name: 'config-is-a-leaf-layer',
      comment: 'config/ 是最底层：被 nuxt.config、app、server 共同消费，反向依赖会造成构建期循环。',
      severity: 'error',
      from: { path: '^config/' },
      to: { path: '^(app|server)/' }
    },
    {
      name: 'i18n-is-a-leaf-layer',
      comment: 'i18n/ 只能依赖 config/；依赖 app/ 会把 UI 层拖进语言包解析链。',
      severity: 'error',
      from: { path: '^i18n/' },
      to: { path: '^(app|server)/' }
    },
    {
      name: 'server-must-not-depend-on-ui',
      comment:
        'server/ 只能复用 app/lib 与 app/types 这类纯逻辑；依赖组件 / 页面 / store 会把 Vue 拖进 Nitro 包。',
      severity: 'error',
      from: { path: '^server/' },
      to: {
        path: '^app/(components|features|pages|layouts|composables|stores|plugins|middleware)/'
      }
    },
    {
      name: 'not-to-unresolvable',
      comment: '解析不到的 import 通常是写错的路径，或是只靠包管理器提升布局才碰巧能跑的幽灵依赖。',
      severity: 'error',
      from: {},
      to: {
        couldNotResolve: true,
        // #imports 是 Nuxt 的虚拟模块，只在构建期存在；样式是 side-effect import，不构成依赖边
        pathNot: ['^#', '\\.(css|scss)$']
      }
    },
    {
      name: 'no-deprecated-core',
      comment: '不要用已废弃的 Node 核心模块 API。',
      severity: 'error',
      from: {},
      to: { dependencyTypes: ['core'], path: '^(punycode|domain|sys)$' }
    }
  ],
  options: {
    tsPreCompilationDeps: true,
    doNotFollow: { path: 'node_modules' },
    // node_modules 的内部结构不是本项目的架构边界，排除掉能让图小一个数量级
    exclude: { path: 'node_modules' },
    enhancedResolveOptions: {
      extensions: ['.ts', '.tsx', '.js', '.mjs', '.vue', '.json'],
      // 只有 exports 映射、没有 main 字段的包（如 ohash）必须给出 conditionNames 才解析得到
      conditionNames: ['import', 'require', 'node', 'default'],
      mainFields: ['module', 'main', 'types']
    },
    // 别名走 webpack 形状的 resolve.alias：dependency-cruiser 的 enhancedResolveOptions
    // 不接受 alias，而 tsconfig paths 只作用于 .ts，解析不了 SFC 里的 ~/ 引用。
    webpackConfig: { fileName: '.dependency-cruiser-alias.cjs' },
    reporterOptions: {
      text: { highlightFocused: true }
    }
  }
}
