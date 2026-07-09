# Ant Design Vue

## 集成方式

模块：`@ant-design-vue/nuxt`

```ts
// nuxt.config.ts
antd: {
  extractStyle: true // SSR 时提取 CSS-in-JS 样式
}
```

组件和 API（如 `message`）可自动导入。

## 主题定制

**色值唯一源**：`config/theme-palette.json`（改色后 `pnpm generate:theme`）。

1. **`config/theme.ts`** — 从 palette 读取 `themeTokens`，映射 Ant Design Design Token：

   - `colorPrimary`、`colorBgBase`、`colorTextBase`
   - `borderRadius`、`fontFamily`
   - `getAntdThemeToken()` → ConfigProvider
   - `applyThemeCssVariables()` → 运行时写入 `--app-*`（**已实现**）

2. **`app/assets/styles/tokens/`** — 页面级 CSS 变量（`--app-*`）：

   - `_variables.scss` — Sass 构建期默认值（自动生成）
   - `_root.scss` — 亮色 `:root` 变量 + 派生 token（渐变/alpha 等）
   - `_dark.scss` — `[data-theme='dark']` 覆盖（自动生成）

3. **`app/assets/styles/tokens.ts`** — 运行时 `cssVarTokens` / `getCssVar`

4. **`useTheme()`** — 切换 light/dark：写入 `data-theme`，并调用 `applyThemeCssVariables` 使 Ant Design 与 `--app-*` 基础色保持同源

完整说明（含双轨分工与 `themeTokenCssVarMap`）见 [样式体系](/tech-stack/styles#主题切换与运行时同步-已实现)。

## Ant Design 语言包

`config/antd-locale.ts` 的 `loadAntdLocale(locale)` 为每种 `SupportedLocale` 动态 `import()` 对应 `ant-design-vue/es/locale/*` 包，供 `app/app.vue` 的 `a-config-provider` 使用。

| 特例    | 行为                                                                       |
| ------- | -------------------------------------------------------------------------- |
| `ph-PH` | Ant Design 无 Filipino 官方包，`ANTD_LOCALE_LOADERS['ph-PH']` 回退 `en_US` |

## 图标按需加载

不要全量引入 `@ant-design/icons-vue`：

```ts
// app/utils/antdIcon.ts
import FolderOutlined from '@ant-design/icons-vue/FolderOutlined'
export { FolderOutlined }
```

页面中：

```vue
<script setup lang="ts">
import { FolderOutlined } from '~/utils/antdIcon'
</script>
```

## 布局组件使用场景

| 组件               | 位置                    |
| ------------------ | ----------------------- |
| `AppHeader`        | 公开页顶栏              |
| `AppShellHeader`   | 产品区顶栏              |
| `UserAccountMenu`  | 产品/编辑器顶栏用户菜单 |
| `LanguageSwitcher` | 语言切换                |
| `ThemeSwitch`      | 主题切换                |

## 关闭暗色模式

1. 在 `tokens/index.scss` 中移除 `@use './dark'`
2. `DEFAULT_THEME_MODE = 'light'`（`config/theme.ts`）
3. 移除 `AppHeader` 中的 `ThemeSwitch`

## 下一步

- [样式体系](/tech-stack/styles)
- [编码约定](/development/conventions)
- [HTTP 请求层](/tech-stack/http)
