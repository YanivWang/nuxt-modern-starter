# 样式体系

## 目录结构

```
app/assets/styles/
├── tokens/
│   ├── _variables.scss   # 自动生成 — Sass 构建期 $（spacing、色值、布局尺寸）
│   ├── _root.scss        # 手写 — :root → --app-* CSS 变量（亮色 + 派生 token）
│   ├── _dark.scss        # 自动生成 — [data-theme='dark'] 暗色覆盖
│   └── index.scss        # 统一入口
├── patterns/
│   ├── _page.scss        # 公开页 UI 模式（.page-panel、.page-faq 等）
│   ├── _product.scss     # 产品区 UI 模式（.workspace-card、.app-shell-nav 等）
│   └── index.scss
├── tokens.ts             # cssVarTokens + getCssVar / setCssVar
└── main.scss             # 全局入口（body、.app-shell、.page-title 等）
```

`nuxt.config.ts` 通过 `css: ['~/assets/styles/main.scss']` 挂载全局样式，并通过 Vite `scss.additionalData` 向所有 SFC 注入 `tokens/_variables.scss`，便于在组件内直接使用 `$spacing-md` 等 Sass 变量。

## 三层职责

| 层                    | 文件                               | 用途                                                 |
| --------------------- | ---------------------------------- | ---------------------------------------------------- |
| 色值单源              | `config/theme-palette.json`        | 品牌色、语义色、暗色覆盖的**唯一编辑入口**           |
| Ant Design 组件 token | `config/theme.ts`                  | `getAntdThemeToken()` → ConfigProvider `theme.token` |
| 页面 CSS 变量         | `tokens/_root.scss` + `_dark.scss` | 组件与页面 `var(--app-*)`                            |
| Sass 构建期变量       | `tokens/_variables.scss`           | SCSS 编译期 `$color-primary` 等（由 palette 生成）   |
| 运行时 JS API         | `app/assets/styles/tokens.ts`      | 图表、Canvas 等读取 `cssVarTokens`                   |
| 公开页模式类          | `patterns/_page.scss`              | 可复用 `.page-*`、`.auth-page` 等                    |
| 产品区模式类          | `patterns/_product.scss`           | 工作台、账户、侧栏等 `.app-*`、`.workspace-card`     |

## 命名约定

- 页面级 CSS 变量统一使用 **`--app-*` 前缀**，避免与 Ant Design `--ant-*` 及第三方库冲突。
- 主题切换通过 `html[data-theme='light'|'dark']` 完成，由 `useTheme()` 写入 `document.documentElement.dataset.theme`。
- 优先使用语义 token（如 `--app-color-brand`、`--app-gradient-panel`），不要在页面中硬编码品牌色、背景色、正文色或边框色。

## 修改色值

**唯一数据源**：`config/theme-palette.json`

```bash
pnpm generate:theme   # 生成 tokens/_variables.scss 与 _dark.scss
```

`prebuild` 钩子也会自动执行生成，日常开发改 palette 后运行上述命令即可。

同步影响：

1. `config/theme.ts` — Ant Design `getAntdThemeToken()`（自动读取 palette）
2. `tokens/_variables.scss` / `_dark.scss` — 构建期 CSS 变量（**自动生成，勿手改**）
3. `tokens/_root.scss` — 渐变、alpha、排版等**派生 token**（手写维护；新增 palette 色后在此映射为 `--app-*`）
4. `useTheme()` — client 运行时 `applyThemeCssVariables()` 同步色板到 `document.documentElement`（**已实现**，见下节）

## 主题切换与运行时同步（已实现）

改色只需编辑 `theme-palette.json`；**Ant Design 与页面基础色在运行时共用同一份 `themeTokens`**，无需再单独做「可选增强」。

切换亮/暗时，`useTheme()` 同时完成两件事，数据都来自 `config/theme.ts` 中的 `themeTokens[mode]`：

| 动作                    | API                                        | 消费者                                  |
| ----------------------- | ------------------------------------------ | --------------------------------------- |
| 写入 `html[data-theme]` | `document.documentElement.dataset.theme`   | `_dark.scss` 选择器、全局样式           |
| 同步基础色 CSS 变量     | `applyThemeCssVariables(mode)`             | 所有 `var(--app-color-*)` 页面/组件样式 |
| 注入 Ant Design token   | `getAntdThemeToken(mode)` → ConfigProvider | `a-button`、`a-card` 等 Ant 组件        |

`applyThemeCssVariables` 通过 `theme-palette.json` 中的 `themeTokenCssVarMap`，将 `colorPrimary`、`colorBrand`、`colorBgBase` 等字段写入对应的 `--app-*` 变量（写在 `<html style="--app-...">` 上，优先级高于 SCSS 中的 `:root` 默认值）。

**双轨分工（刻意设计，不是缺陷）：**

| 轨道                                    | 负责内容                                                                | 作用                                                                            |
| --------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| **SCSS**（`_root.scss` / `_dark.scss`） | SSR 首屏默认值；渐变、alpha、nav-hover 等**派生** token；间距/圆角/字号 | 无 JS 时也有样式；`color-mix(..., var(--app-color-primary))` 随基础色自动更新   |
| **JS**（`applyThemeCssVariables`）      | palette 中的**基础色** → `--app-*`                                      | 保证切主题后 Ant Design 与自定义 CSS 读同一套色值，避免「组件色与页面色不一致」 |

**不必再做：**

- 把渐变、阴影、间距等也改成 JS 写入 — 复杂度高、SSR 首屏易闪、收益很小
- 完全去掉 SCSS 色值、只靠运行时注入 — 不利于 SSR 与静态构建

**维护注意：** 若在 palette 中新增基础色，需同步更新 `themeTokenCssVarMap`（映射到 `--app-*`）并在 `_root.scss` 中补充派生 token（如有需要）。改完后运行 `pnpm generate:theme`。

---

## Token 目录（`--app-*`）

以下变量定义于 `tokens/_root.scss`（亮色默认值）；暗色模式下 `_dark.scss` 会覆盖色值相关项，渐变/阴影在暗色块中另有语义调整。

### 品牌与交互色

| Token                        | 语义                             | 典型用途            |
| ---------------------------- | -------------------------------- | ------------------- |
| `--app-color-primary`        | 主交互色（链接、选中、强调按钮） | 导航 active、主 CTA |
| `--app-color-primary-hover`  | 主色悬停                         | 按钮 hover          |
| `--app-color-primary-active` | 主色按下                         | 按钮 active         |
| `--app-color-primary-subtle` | 主色浅底                         | 选中背景、标签底    |
| `--app-color-primary-border` | 主色描边                         | 聚焦边框、选中描边  |
| `--app-color-brand`          | 品牌识别色                       | Logo、标题强调      |
| `--app-color-brand-hover`    | 品牌色悬停                       | 品牌按钮 hover      |
| `--app-color-brand-contrast` | 品牌色上的对比文字               | 实心品牌按钮文字    |

### 表面与背景

| Token                        | 语义             | 典型用途                            |
| ---------------------------- | ---------------- | ----------------------------------- |
| `--app-color-bg`             | 页面主背景       | `body`、产品页底色                  |
| `--app-color-elevated`       | 抬升层背景       | Hero 渐变起点、卡片 hover 底        |
| `--app-color-bg-canvas`      | 画布背景         | 产品区整页底（`.app-product-page`） |
| `--app-color-surface`        | 卡片/面板表面    | Card、侧栏、数据面板                |
| `--app-color-overlay`        | 遮罩层           | Modal 背板                          |
| `--app-color-fill-secondary` | 次级填充         | 列表 hover、muted 区块              |
| `--app-color-fill-tertiary`  | 三级填充         | 更弱的区分底                        |
| `--app-color-surface-muted`  | 弱化表面（派生） | 嵌套区块、次要面板                  |

### 文字

| Token                     | 语义     | 典型用途         |
| ------------------------- | -------- | ---------------- |
| `--app-color-text`        | 正文     | 段落、表单值     |
| `--app-color-text-strong` | 强调正文 | 标题、数据值     |
| `--app-color-muted`       | 次要文字 | 标签、说明、占位 |
| `--app-color-subtle`      | 最弱文字 | 元信息、时间戳   |

### 边框

| Token                       | 语义     | 典型用途             |
| --------------------------- | -------- | -------------------- |
| `--app-color-border`        | 默认边框 | 卡片、分割线         |
| `--app-color-border-strong` | 强调边框 | 输入框、Sign in 按钮 |

### 语义状态色

| Token                                                              | 语义             |
| ------------------------------------------------------------------ | ---------------- |
| `--app-color-success` / `--app-color-success-subtle`               | 成功状态         |
| `--app-color-warning` / `--app-color-warning-subtle`               | 警告状态         |
| `--app-color-danger` / `--app-color-danger-subtle`                 | 危险/删除        |
| `--app-color-info`                                                 | 信息提示         |
| `--app-color-avatar-fallback` / `--app-color-avatar-fallback-text` | 无头像时的占位圆 |

### 产品导航

| Token                       | 语义                |
| --------------------------- | ------------------- |
| `--app-color-nav-hover-bg`  | 侧栏链接 hover 背景 |
| `--app-color-nav-active-bg` | 侧栏当前路由背景    |

### 项目卡片强调色

| Token                         | 对应 modifier             |
| ----------------------------- | ------------------------- |
| `--app-project-accent-violet` | `.workspace-card--violet` |
| `--app-project-accent-cyan`   | `.workspace-card--cyan`   |
| `--app-project-accent-rose`   | `.workspace-card--rose`   |

另有 `.workspace-card--blue|green|amber` 使用 primary / success / warning 语义色。

### Alpha 辅助色（派生）

通过 `color-mix` 从 brand/primary 派生，用于渐变节点与柔和阴影，无需在组件中写 `rgb(... / x%)`：

| 前缀                     | 示例                                             |
| ------------------------ | ------------------------------------------------ |
| `--app-color-brand-a*`   | `a5` `a6` `a7` `a8` `a9` `a12` `a14` `a16` `a18` |
| `--app-color-primary-a*` | `a7` `a8` `a10` `a13` `a16` `a20` `a22` `a32`    |

### 渐变

| Token                         | 语义                              |
| ----------------------------- | --------------------------------- |
| `--app-gradient-brand-accent` | 品牌→主色对角渐变（Logo、强调条） |
| `--app-gradient-accent-line`  | 水平品牌强调线                    |
| `--app-gradient-hero`         | 营销 Hero 纵向渐变                |
| `--app-gradient-home-page`    | 首页整页背景（径向 + 纵向）       |
| `--app-gradient-hero-glow`    | Hero 光晕叠加                     |
| `--app-gradient-page-header`  | 内页页头光晕                      |
| `--app-gradient-panel`        | 大面板背景（径向高光 + 表面渐变） |
| `--app-gradient-surface-card` | 卡片表面纵向渐变                  |

### 阴影与层级（Elevation）

| Token                        | 语义                   | 建议使用场景                    |
| ---------------------------- | ---------------------- | ------------------------------- |
| `--app-shadow-elevation-1`   | 最低抬升               | 侧栏、数据面板、静态卡片        |
| `--app-shadow-elevation-2`   | 中等抬升               | 可交互卡片（`.workspace-card`） |
| `--app-shadow-elevation-3`   | 最高抬升               | 浮层、重要弹层                  |
| `--app-shadow-surface`       | 品牌调性表面阴影       | 营销卡片默认                    |
| `--app-shadow-surface-hover` | 表面 hover 加深        | 卡片 hover、`--app-shadow-sm`   |
| `--app-shadow-brand`         | 品牌色扩散阴影         | 品牌 CTA                        |
| `--app-shadow-primary`       | 主色扩散阴影           | 主按钮、首页 CTA                |
| `--app-shadow-dropdown`      | 下拉/弹出层            | 语言面板、菜单                  |
| `--app-shadow-sm`            | 别名 → `surface-hover` | 轻量 hover 反馈                 |

**排版语义**：字号与行高 token 用于跨公开页与产品区保持一致节奏，不替代 Ant Design 组件内置字号。

| 类别   | Token                                                  |
| ------ | ------------------------------------------------------ |
| 字号   | `--app-text-xs` `sm` `base` `md` `lg` `xl` `2xl` `3xl` |
| 行高   | `--app-leading-tight` `normal` `relaxed`               |
| 字重   | `--app-weight-medium` `semibold` `bold` `extrabold`    |
| 字体族 | `--app-font-sans`                                      |
| 聚焦环 | `--app-focus-ring`                                     |

### 布局与公开页 Header

| Token                                                | 语义                                           |
| ---------------------------------------------------- | ---------------------------------------------- |
| `--app-container-max`                                | 页面最大宽度                                   |
| `--app-container-padding`                            | 水平内边距                                     |
| `--app-content-max-prose`                            | 散文阅读宽度（`PageContainer layout="prose"`） |
| `--app-content-max-compact`                          | 紧凑内容宽度                                   |
| `--app-header-control-size`                          | Header 行高/控件尺寸                           |
| `--app-header-icon-size` / `--app-header-nav-gap` 等 | Header 内部间距与图标                          |
| `--app-auth-sign-in-*` / `--app-auth-sign-up-*`      | 登录/注册按钮主题                              |
| `--app-header-blur` / `--app-header-bg-scrolled`     | 滚动后 Header 毛玻璃                           |
| `--app-theme-switch-*`                               | 主题切换开关尺寸                               |
| `--app-lang-panel-*` / `--app-lang-item-*`           | 语言面板                                       |
| `--app-home-cta-*`                                   | 首页 CTA 区块                                  |

### 产品区布局

| Token                         | 语义                |
| ----------------------------- | ------------------- |
| `--app-product-sidebar-width` | 账户/工作台侧栏宽度 |
| `--app-product-nav-radius`    | 侧栏导航圆角        |

### 间距、圆角、z-index

| 类别 | Token                                                                        |
| ---- | ---------------------------------------------------------------------------- |
| 间距 | `--app-spacing-xs` `sm` `md` `lg` `xl`                                       |
| 圆角 | `--app-radius-base` `medium` `large` `lg`（`lg` 多用于营销区块）             |
| 层级 | `--app-z-index-base` `dropdown` `sticky` `fixed` `modal` `popover` `tooltip` |

Sass 侧与上述对齐的 `$spacing-*`、`$radius-*`、`$z-index-*` 定义在自动生成的 `_variables.scss` 中，供 SCSS 编译期使用。

---

## 公开页 Pattern（`patterns/_page.scss`）

在页面根节点使用组合类，避免在 SFC 中重复写 panel/card/faq 样式。

| 类名                                   | 用途                      |
| -------------------------------------- | ------------------------- |
| `.page-badge`                          | 页内小标签                |
| `.page-panel` / `.page-panel__title`   | 带标题的内容面板          |
| `.page-section-title`                  | 区块标题                  |
| `.page-surface-card`                   | 表面卡片（渐变底 + 阴影） |
| `.page-check-list` / `.page-step-list` | 勾选列表、步骤列表        |
| `.page-meta` / `.page-note`            | 元信息、提示说明          |
| `.page-back-link` / `.page-text-link`  | 返回链接、文内链接        |
| `.page-content-block`                  | 标准内容块间距            |
| `.page-grid` / `.page-grid--2` / `--3` | 响应式网格                |
| `.page-stat-card`                      | 数据指标卡                |
| `.page-faq`                            | FAQ 折叠区块              |
| `.auth-page` / `.auth-card`            | 登录注册页                |
| `.page-empty-state`                    | 空状态                    |
| `.error-page`                          | 错误页                    |

全局标题类 `.page-title`、`.page-lead`、`.page-eyebrow` 定义在 `main.scss`。布局容器使用 `<PageContainer layout="prose|compact" />`。

---

## 产品区 Pattern（`patterns/_product.scss`）

产品区组件应优先挂载以下全局类，**不要在 SFC scoped 样式中重复实现相同结构**。

### 页面骨架

```html
<div class="app-product-page">
  <header class="app-product-header">
    <div class="app-product-header__inner">...</div>
  </header>
  <main>...</main>
</div>
```

- `.app-product-page` — 全屏画布底（`--app-color-bg-canvas`）
- `.app-product-header` — 粘性顶栏，底边框 + 表面背景
- `.app-product-sidebar` — 侧栏容器（圆角卡片式）

### 侧栏导航

```html
<nav class="app-shell-nav">
  <NuxtLink class="app-shell-nav__link" to="..."> <Icon /> 工作台 </NuxtLink>
  <a class="app-shell-nav__link app-shell-nav__link--footer" href="...">帮助</a>
</nav>
```

- 默认 muted 文字；`:hover` 使用 `--app-color-nav-hover-bg`
- `.router-link-active` 使用 `--app-color-nav-active-bg` + `--app-color-primary`
- `--footer` 修饰符用于底部弱强调链接

参考：`AccountShell`、`ProductShell`。

### 数据面板（账户设置等）

```html
<a-card class="app-data-panel">
  <h2 class="app-data-panel__title">基本信息</h2>
  <div class="app-data-panel__rows">
    <div class="app-data-row">
      <span class="app-data-row__label">邮箱</span>
      <span class="app-data-row__value">user@example.com</span>
      <button class="app-data-row__action">编辑</button>
    </div>
    <div class="app-data-row app-data-row--last">...</div>
  </div>
</a-card>
```

- `.app-data-row` — 三列网格：标签 | 值 | 操作；行间细分隔线
- `.app-data-row__value--strong` / `--muted` / `--empty` — 值样式变体
- `.app-data-panel__alert` — 面板内提示条

参考：`AccountPage`。

### 头像占位

```html
<span class="app-avatar-fallback app-avatar-fallback--md">WC</span>
```

尺寸修饰符：`--sm` `--md` `--lg`；`--image` 用于真实图片裁剪。

### 危险操作按钮

```html
<button type="button" class="app-btn-danger-outline">删除账户</button>
```

描边危险样式，带 `--app-focus-ring` 可访问聚焦。

### 工作台项目卡片

```html
<article class="workspace-card workspace-card--violet">
  <div class="workspace-card__preview">...</div>
  <div class="workspace-card__body">
    <h3 class="workspace-card__title">项目名称</h3>
    <p class="workspace-card__meta">...</p>
  </div>
</article>
```

| 区块   | 类名                                                   | 说明                                              |
| ------ | ------------------------------------------------------ | ------------------------------------------------- |
| 根     | `.workspace-card`                                      | 可点击卡片，hover 抬升 `--app-shadow-elevation-3` |
| 强调色 | `.workspace-card--{blue,green,violet,amber,cyan,rose}` | 封面 accent 与装饰线                              |
| 预览区 | `__preview` `__thumbnail` `__cover*`                   | 封面图/渐变/装饰动画                              |
| 操作   | `__favorite` `__preview-actions` `__more`              | 收藏、悬停操作、更多菜单                          |
| 正文   | `__body` `__title` `__meta`                            | 标题与元信息                                      |
| 菜单   | `__menu` `__menu-delete`                               | 下拉菜单与删除项                                  |

参考：`WorkspaceProjectCard`。

---

## Stylelint 约束

`stylelint.config.mjs` 对 **产品区与公开 UI 代码** 启用 `color-no-hex`：

| 范围                            | 规则                                      |
| ------------------------------- | ----------------------------------------- |
| `app/components/**`             | 禁止 `#hex` / `#rgb`，须用 `var(--app-*)` |
| `app/features/**`               | 同上                                      |
| `app/pages/**`                  | 同上                                      |
| `app/layouts/**`                | 同上                                      |
| `app/assets/styles/tokens/**`   | **豁免**（色值定义层）                    |
| `app/assets/styles/patterns/**` | **豁免**（允许 `color-mix` 与少量固定色） |

```bash
pnpm stylelint   # 本地检查
```

违反时提示：`Use var(--app-*) design tokens instead of hex colors in product/public UI code.`

---

## 运行时 API（`tokens.ts`）

```ts
import { cssVarTokens, getCssVar, setCssVar } from '~/assets/styles/tokens'

const brand = getCssVar(cssVarTokens.color.brand)
// 图表、Canvas 等需要读取计算后色值时使用
```

- `cssVarTokens` — 与 `_root.scss` 对齐的常量表
- `getCssVar` / `setCssVar` — 读写 `document.documentElement` 上的 CSS 变量
- `applyThemeCssVariables` — **已实现**：`useTheme()` 切主题时调用，将 `themeTokens` 基础色写入 `--app-*`（与 Ant Design 同源）

---

## 关闭暗色模式

1. 删除或注释 `tokens/_dark.scss` 的 `@use`（`tokens/index.scss`）
2. `config/theme.ts` 中 `DEFAULT_THEME_MODE = 'light'`
3. 移除 `AppHeader` 中的 `ThemeSwitch`

## 下一步

- [Ant Design Vue 主题](/tech-stack/ant-design-vue)
- [编码约定](/development/conventions)
