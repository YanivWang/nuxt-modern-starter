/*
  【文件职责】
    Nuxt app.config：品牌名、layout 开关默认值、theme defaultMode。
    运行时可通过环境或部署覆盖部分 UI 默认。

  【架构位置】
    共享层 — app/app.config.ts，useAppConfig() 只读访问。

  【主要导出 / 路由】
    defineAppConfig default export

  【依赖关系】
    - 依赖：config/theme DEFAULT_THEME_MODE
    - 被引用：BaseLogo brand.name 等

  【渲染 / 数据】
    无 — 构建期/启动期配置。

  【边界与注意】
    brand.tagline 与 i18n brand.tagline 独立；Logo 用 appConfig.brand.name。
*/
import { DEFAULT_THEME_MODE } from '../config/theme'

export default defineAppConfig({
  brand: {
    name: 'Nuxt Modern Starter',
    tagline: 'Modern Nuxt starter for public websites'
  },
  layout: {
    showHeader: true,
    showFooter: true
  },
  theme: {
    defaultMode: DEFAULT_THEME_MODE
  }
})
