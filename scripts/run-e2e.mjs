#!/usr/bin/env node
/*
  【文件职责】
    跑一轮 E2E：先解析端口，再用同一份端口去构建与执行 Playwright。

  【架构位置】
    scripts — pnpm test:e2e 的入口，位于 build:e2e 与 playwright test 之间。

  【主要导出 / 路由】
    无（可执行脚本）；透传 playwright test 的退出码。

  【依赖关系】
    - 依赖：.env.e2e（默认值来源）、playwright.config.ts、tests/e2e/support.ts（读同一组端口变量）
    - 被引用：package.json 的 test:e2e、CI e2e job

  【渲染 / 数据】
    无

  【边界与注意】
    这一层存在的唯一理由：预渲染页在**构建时**就把 siteUrl 烤进 HTML
    （canonical、hreflang、sitemap、JSON-LD）。只在启动 preview 时注入端口是不够的 ——
    首页是预渲染的，它带的仍是构建时那个端口，断言会对不上。
    因此端口必须在 build 与 preview 两个阶段拿到同一份值，这里统一算一次再往下传。

    端口默认值以本文件为准；playwright.config.ts 与 tests/e2e/support.ts 读同样的
    E2E_APP_PORT / STUB_API_PORT，供不重新构建的 pnpm test:e2e:only 复用。
    已显式设置的 NUXT_PUBLIC_* 不覆盖，方便临时指向别的站点或桩后端。
*/
import { spawnSync } from 'node:child_process'

const APP_PORT = process.env.E2E_APP_PORT || '3399'
const STUB_API_PORT = process.env.STUB_API_PORT || '2127'

const env = {
  ...process.env,
  E2E_APP_PORT: APP_PORT,
  STUB_API_PORT,
  // dotenv 不覆盖已存在的 env，所以这里设好的值对 .env.e2e 有优先权
  NUXT_PUBLIC_SITE_URL: process.env.NUXT_PUBLIC_SITE_URL || `http://127.0.0.1:${APP_PORT}`,
  NUXT_PUBLIC_API_BASE:
    process.env.NUXT_PUBLIC_API_BASE || `http://127.0.0.1:${STUB_API_PORT}/api/v1`
}

const run = (command, args) => {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    env,
    shell: process.platform === 'win32'
  })

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

// 构建与执行必须用同一份 env，否则预渲染产物里的 siteUrl 会和运行端口对不上
run('corepack', ['pnpm', 'run', 'build:e2e'])
run('corepack', ['pnpm', 'exec', 'playwright', 'test'])
