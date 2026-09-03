# Coverage Report

Source: docs-sync/manifest.json（内容变化才会产生 diff，不含生成时间）

## Enumeration

```bash
find app server config docker scripts nuxt.config.ts vitest.config.ts playwright.config.ts -type f \( -name "*.ts" -o -name "*.vue" -o -name "*.js" -o -name "*.mjs" -o -name "*.scss" -o -name "*.yaml" -o -name "*.conf" \) 2>/dev/null | sort
```

**Source file count:** 156

**Documentation file count:** 33

## Batch distribution

- Batch 1 (config + nuxt.config): 14 files
- Batch 2 (app/lib/http + app/api): 8 files
- Batch 3 (middleware + plugins + composables + utils): 22 files
- Batch 4 (stores + layouts + components + app-root): 24 files
- Batch 5 (pages + feature-workspace + feature-editor): 42 files
- Batch 6 (feature-account + product-shell + templates): 10 files
- Batch 7 (server + assets/styles): 25 files
- Batch 8 (docker + 构建脚本 + 测试配置 + doc-review): 11 files

## Missing header comments

(none)
