# i18n 链路评估与修复方案

> 评估基准：当前项目 `nuxt-modern-starter` 多语言实现（参考 `aippt-home/scripts/scan-i18n.mjs` 精简而来）  
> 评估日期：2026-07-08

---

## 总体结论

| 维度             | 评分      | 说明                                                      |
| ---------------- | --------- | --------------------------------------------------------- |
| 运行时 i18n 链路 | ⭐⭐⭐⭐½ | 路由、加载、SEO、产品页语言中性策略设计成熟，单测覆盖较好 |
| 脚本 diff 生成   | ⭐⭐⭐⭐  | 已适配本项目「模块 spread 扁平化」结构，key 与 `t()` 一致 |
| 脚本 scan / 治理 | ⭐⭐      | 命令语义混乱、动态 key 误报、缺少 apply / CI 门禁         |
| 翻译内容         | ⭐⭐      | 156 个 key 结构齐全，但除 `zh-CN` 外基本为 en-US 英文占位 |

**结论**：运行时链路可直接用于 starter；i18n 脚本完成了 diff 快照能力，但尚未形成完整的「翻译治理工具链」。

---

## 一、运行时链路（整体健康，有小问题）

### 架构概览

```
URL / Cookie
    ↓
locale.global middleware → resolveLocaleRouteDecision
    ↓
languageStore.chooseLanguage → loadLocaleMessages → vue-i18n t()
    ↓
useLocalePath（公开页加前缀）/ getSwitchLanguageUrl（产品页不改 URL）
```

### 与 aippt-home 的有意差异（非 bug）

| 维度           | aippt-home                                             | 当前项目                                                   |
| -------------- | ------------------------------------------------------ | ---------------------------------------------------------- |
| 默认语言       | `en-US`                                                | `zh-CN`                                                    |
| 文案结构       | 嵌套 `{ global, home, ... }`，key 如 `global.nav.home` | spread 扁平 `{ ...global, ...product }`，key 如 `nav.home` |
| 持久化         | localStorage                                           | cookie（SSR 友好）                                         |
| fallbackLocale | `en-US`                                                | `zh-CN`                                                    |

当前项目的扁平 key 对业务代码更友好；脚本 `normalizeLocaleMessages` 与运行时 spread 一致，这一点比直接照搬 aippt 更合理。

---

## 二、发现的问题

### P0 — 命令语义混乱 / 功能缺失

#### 问题 1：`i18n:flat` 与 `i18n:diff` 完全重复

**位置**：`scripts/i18n-manager.mjs`

```javascript
if (command === 'diff' || command === 'flat') {
  const diffRows = buildLocaleDiff(i18nRoot)
  writeJson(command === 'diff' ? diffPath : flatPath, diffRows)
}
```

两个命令输出内容相同，仅写入路径不同（`i18n-diff.json` vs `i18n-diff-flat.json`）。

**参考项目行为**：

- aippt `flat`：复制 diff，或 `-p` 将 flat 补丁合并回 diff
- aippt `scan`：找出**未使用**的冗余 key

**当前项目行为**：

- `scan` 输出的是**已使用** key 到 `i18n-diff-flat.json`，语义与 aippt **相反**

**影响**：文档（`docs-site/reference/scripts.md`）与命令实际行为不一致，团队易误用。

---

#### 问题 2：缺少 `apply` 命令

aippt-home 有 `apply` / `patchFlatToDiff`，可将 `diff.json` 批量写回各语言 `modules/*.json`。

当前项目只能生成快照，无法闭环「翻译平台 → 回写代码」流程。

---

#### 问题 3：`scan` 对动态 key 严重误报

**扫描逻辑**：`fileContent.includes(row.key)` 简单子串匹配。

**动态 key 示例**（`app/pages/[[language]]/about.vue`）：

```javascript
const values = computed(() => valueKeys.map((key) => t(`about.values.items.${key}`)))
const storyParagraphs = computed(() => storyKeys.map((key) => t(`about.story.paragraphs.${key}`)))
```

**实测**：156 个 key 中 scan 报 26 个「未使用」，其中约 20 个为误报，包括：

- `about.story.paragraphs.*`
- `about.values.items.*`
- `help.quickStart.steps.*`
- `help.resources.*`

真正可能冗余的 key（如 `workspace.nav`、`editor.eyebrow`）混在误报中，scan 结果不可信。

---

### P1 — 扫描质量与性能

#### 问题 4：子串匹配存在误报风险

`includes('nav.home')` 可能匹配到 `nav.homepage` 等无关文本。

---

#### 问题 5：扫描范围包含 i18n JSON 自身

`DEFAULT_INCLUDE_DIRS` 含 `tests`、`docs` 等；locale 文件内的 key 字符串也会被算作「已使用」，高估使用率。

---

#### 问题 6：性能 O(keys × files)

每个 key 遍历所有文件并 `readFileSync`。当前 156 key 约 2.4s；规模增大后明显变慢。

---

#### 问题 7：`Function()` 解析 inline export 较脆弱

**位置**：`scripts/i18n-manager-lib.mjs` → `readLocaleMessages`

```javascript
return { index: Function(`return (${exportBody})`)() }
```

当前各 locale 均为标准 `import + spread`，暂无问题；index.ts 写法变化时可能 silent break。

---

### P2 — 治理与维护成本

#### 问题 8：三处手动注册语言，无一致性校验

| 位置             | 内容                                                                   |
| ---------------- | ---------------------------------------------------------------------- |
| `config/site.ts` | `SUPPORTED_LOCALES`、`SITE_LOCALE_PREFIX_MAP`                          |
| `i18n/index.ts`  | `SITE_LANG_MAP`、`LOCALE_MESSAGE_RESOLVERS`、`LOCALE_LANGUAGE_MODULES` |
| `i18n/<locale>/` | 目录与 modules                                                         |

新增语言需改 3 处 + 文档 + 测试；脚本未校验「配置了但没目录 / 有目录但没注册」。

---

#### 问题 9：翻译内容基本是英文占位

除 `zh-CN` 外，13 个语言 **100% 与 en-US 相同**（含 `zh-HK` 仍为英文）。diff 无法区分「已翻译」与「占位复制」。

---

#### 问题 10：双轨内容本地化

`config/content/faq.ts` 独立维护 FAQ 多语言，与 `i18n/*.json` 分离。架构上有意区分 UI 文案与内容域，但运营需维护两套，文档说明不足。

---

#### 问题 11：无 CI 门禁

`pnpm quality` 未包含 i18n 校验；`i18n-diff*.json`（2800+ 行）提交在仓库，缺少与源码同步的自动检查。

---

### 运行时小优化

#### 问题 12：middleware 重复加载 locale

**位置**：`app/middleware/locale.global.ts`

```javascript
await languageStore.chooseLanguage(decision.locale)
await loadLocaleMessages(decision.locale) // chooseLanguage 内部已调用，冗余
```

幂等但多余；插件与 middleware 两处都会触发 `loadLocaleMessages`。

---

#### 问题 13：语言元数据重复定义

`SITE_LANG_MAP` 的 `id` / `pathPrefix` / `label` 与 `config/site.ts` 的 prefix 映射部分重叠，新增语言时易漏改。

---

## 三、解决方案

### 短期（低成本，高收益）

#### 1. 理顺命令语义

| 命令                                | 建议行为                                                                                   |
| ----------------------------------- | ------------------------------------------------------------------------------------------ |
| `i18n:diff`                         | 全量快照 → `scripts/i18n-diff.json`；输出缺失统计；标记与 en-US 相同的条目为 `placeholder` |
| `i18n:scan`                         | 对齐 aippt：输出**未使用** key 列表（冗余文案）                                            |
| `i18n:used`（新增）或 `scan --used` | 输出项目中实际引用的 key                                                                   |
| `i18n:flat`                         | **删除**或改为「仅输出 flat 结构 / 缺失条目子集」，避免与 diff 重复                        |

**实现要点**：

```javascript
// scan 默认：unused keys
export function scanUnusedKeys(diffRows, rootDir) {
  const usedKeys = collectUsedKeys(rootDir) // 见下方改进
  return diffRows.filter((row) => !usedKeys.has(row.key))
}

// 新增 used
export function scanUsedKeys(diffRows, rootDir) {
  const usedKeys = collectUsedKeys(rootDir)
  return diffRows.filter((row) => usedKeys.has(row.key))
}
```

同步更新 `docs-site/reference/scripts.md` 与 `docs-site/architecture/i18n.md`。

---

#### 2. 改进 key 收集（fix scan 误报）

**方案 A — 正则提取静态 key**：

```javascript
const STATIC_KEY_PATTERNS = [
  /\bt\s*\(\s*['"]([^'"]+)['"]/g,
  /\$t\s*\(\s*['"]([^'"]+)['"]/g,
  /statusMessage:\s*['"]([^'"]+)['"]/g,
  /te\s*\(\s*['"]([^'"]+)['"]/g
]
```

**方案 B — 识别常见动态模式**：

同文件内若存在：

```javascript
const valueKeys = ['focus', 'quality', 'openness'] as const
t(`about.values.items.${key}`)
```

则展开为 `about.values.items.focus` 等完整 key。

**实现 sketch**：

```javascript
// 匹配 const xxxKeys = ['a', 'b'] + t(`prefix.${key}`)
function expandDynamicKeys(source) {
  const keys = new Set()
  const arrayMatch = source.matchAll(/const\s+\w+Keys\s*=\s*\[([^\]]+)\]/g)
  const templateMatch = source.matchAll(/t\s*\(\s*`([^$`]+)\$\{[^}]+\}`/g)
  // 组合 prefix + array items → 完整 key
  return keys
}
```

**扫描范围调整**：

- 排除 `i18n/` 目录，避免 JSON 内 key 自引用
- 可选排除 `scripts/i18n-diff*.json`

---

#### 3. 新增 `i18n:check` 门禁（可进 CI）

```bash
pnpm i18n:check
```

**检查项**：

1. `i18n/` 目录名 ↔ `config/site.ts` 的 `SUPPORTED_LOCALES` 一致
2. 各语言 key 集合一致（无缺失）
3. 报告与 `en-US` 完全相同的条目比例（placeholder 率）
4. （可选）fail on unused keys 超过阈值

**package.json**：

```json
"i18n:check": "node scripts/i18n-manager.mjs check"
```

**CI 集成**（`pnpm quality` 或单独 job）：

```json
"quality": "... && pnpm i18n:check"
```

---

#### 4. 去掉 middleware 重复调用

**修改**：`app/middleware/locale.global.ts`

```diff
  await languageStore.chooseLanguage(decision.locale)
- await loadLocaleMessages(decision.locale)
```

`chooseLanguage` 已内含 `loadLocaleMessages`。

---

### 中期

#### 5. 实现 `apply` 命令

参考 aippt `patchDiffToI18n`：

```bash
pnpm i18n:apply
```

- 读取 `scripts/i18n-diff.json`
- 按 key 前缀（如 `home.title` → `marketing.json` 内 `home.title`）写回各 locale 的 `modules/*.json`
- 需约定 key 与 module 的映射规则（当前 spread 结构：按 top-level namespace 分 module，或维护 key → module 映射表）

**注意**：本项目 key 无 module 前缀（`nav.home` 而非 `global.nav.home`），apply 需根据 key 第一段或映射表定位目标 JSON 文件。

---

#### 6. 从 `config/site.ts` 生成语言注册骨架

减少 `i18n/index.ts` 手工维护：

```typescript
// 伪代码：构建时或脚本生成 LOCALE_MESSAGE_RESOLVERS
SUPPORTED_LOCALES.forEach((locale) => {
  if (locale === DEFAULT_LOCALE) return
  resolvers[locale] = () => import(`./${locale}/index`).then((m) => m.default)
})
```

`SITE_LANG_MAP` 的 label 可移至 `config/site.ts` 统一管理。

---

#### 7. 处理 `i18n-diff*.json` 仓库策略

**选项 A**：改为 CI 产物，不提交仓库，`.gitignore` 忽略  
**选项 B**：保留提交，加 pre-commit / CI 校验 `pnpm i18n:diff` 与 committed 文件一致

---

### 长期（按产品需求）

#### 8. 完整翻译 pipeline

- flat key export → 翻译平台 → `apply` 回写
- placeholder 检测与翻译进度报表
- 按市场优先级补译（如优先 `zh-HK` 繁体，而非 13 份英文复制）

#### 9. FAQ 双轨文档化

在 `docs-site/architecture/i18n.md` 明确：

- UI 文案：`i18n/<locale>/modules/*.json`
- 结构化内容：`config/content/*.ts`（FAQ 等）
- 新增内容时的 checklist

---

## 四、与 aippt-home 能力对比

| 能力          | aippt-home        | 当前项目        | 建议                 |
| ------------- | ----------------- | --------------- | -------------------- |
| diff 生成     | ✅ 硬编码语言列表 | ✅ 自动发现     | 保持                 |
| key 结构      | `global.nav.home` | `nav.home`      | 保持（匹配运行时）   |
| apply 回写    | ✅                | ❌              | 中期实现             |
| flat 补丁     | ✅ `-p`           | ❌（flat=diff） | 删除或重写 flat      |
| scan 冗余 key | ✅ unused         | ⚠️ 输出 used    | 改 scan 语义         |
| 缺失翻译报告  | ✅ diff 时统计    | ❌              | check 命令补充       |
| 单测          | ❌                | ✅ lib 单测     | 扩展 scan/check 单测 |

---

## 五、建议实施顺序

| 优先级 | 任务                                      | 预估工作量 |
| ------ | ----------------------------------------- | ---------- |
| P0     | 修 scan 动态 key 误报 + 理顺命令语义      | 小         |
| P0     | 更新文档与 `i18n_bug_fix.md` 验收标准     | 小         |
| P1     | 新增 `i18n:check` + CI                    | 小         |
| P1     | 去掉 middleware 重复 `loadLocaleMessages` | 极小       |
| P2     | 实现 `apply`                              | 中         |
| P2     | 从 `site.ts` 生成语言注册                 | 中         |
| P3     | diff JSON 仓库策略 / 翻译 pipeline        | 大         |

---

## 六、验收标准

完成短期修复后，应满足：

- [ ] `pnpm i18n:scan` 不再将 `about.values.items.focus` 等动态 key 报为 unused
- [ ] `i18n:flat` 与 `i18n:diff` 行为不再重复，或 flat 已删除
- [ ] `pnpm i18n:check` 可检测 locale 目录与 `SUPPORTED_LOCALES` 不一致
- [ ] `locale.global.ts` 无重复 `loadLocaleMessages`
- [ ] 文档与 package.json scripts 描述一致
- [ ] `tests/unit/i18n-manager.test.ts` 覆盖动态 key 展开与 check 逻辑

---

## 附录：当前数据快照

| 指标                             | 数值               |
| -------------------------------- | ------------------ |
| 总 key 数                        | 156                |
| scan 报 used（当前 flat 逻辑）   | 130                |
| scan 报 unused                   | 26（约 20 个误报） |
| 各语言缺失 key                   | 0                  |
| 非 zh-CN/en-US 与 en-US 相同比例 | 100%（占位）       |
