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

1. **`config/theme.ts`** — 映射 Ant Design Design Token：

   - `colorPrimary`
   - `colorBgBase`
   - `colorTextBase`
   - `borderRadius`
   - `fontFamily`

2. **`app/assets/styles/tokens.scss`** — 页面级 CSS 变量

3. **`useTheme()`** — 运行时切换 light/dark，写入 `document.documentElement.dataset.theme`

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

1. `tokens.scss` 只保留 light 变量
2. `DEFAULT_THEME_MODE = 'light'`
3. 移除 `AppHeader` 中的 `ThemeSwitch`

## 下一步

- [编码约定](/development/conventions)
- [HTTP 请求层](/tech-stack/http)
