/*
  【文件职责】
    dependency-cruiser 的模块别名声明（webpack resolve 形状）。
    单独成文件是因为 dependency-cruiser 只从 webpackConfig 读 resolve.alias，
    它的 enhancedResolveOptions 不接受 alias 字段。

  【边界与注意】
    这里的别名必须与 Nuxt 保持一致：srcDir 是 app/，所以 ~ 与 @ 都指向 app/。
    不一致会让 `~/features/...` 停留在未解析状态，边界规则静默失效。
*/
const path = require('node:path')

const APP_DIR = path.resolve(__dirname, 'app')

module.exports = {
  resolve: {
    alias: {
      '~': APP_DIR,
      '@': APP_DIR,
      '~~': __dirname,
      '@@': __dirname
    }
  }
}
