/*
  【文件职责】
    单测：缓存安全不变量 —— SSR 输出不得依赖登录态，令牌不得进入 SSR payload。
    这是 prerender / SWR 路由的正确性前提：Nitro 缓存键只按 path、不区分 cookie，
    任何随登录态变化的 SSR 输出都会被缓存并发给其他访客。

  【架构位置】
    tests/unit — Pinia 行为断言 + 公开页组件可达性静态检查，无运行时服务。

  【主要导出 / 路由】
    describe SSR cache safety

  【依赖关系】
    - 依赖：app/stores/auth.ts、app/utils/auth-session.ts、app/layouts/default.vue、
      app/pages/[[language]]/**、app/components/**
    - mock：无

  【渲染 / 数据】
    @pinia/nuxt 在 app:rendered 时执行 payload.pinia = toRaw($pinia).state.value，
    因此 store state 等价于「写进 SSR HTML 的内容」。

  【边界与注意】
    新增 auth store state 前先确认它对匿名访客可见也无害。
    公开页新增依赖登录态的 UI 时必须包在 <ClientOnly> 内，否则本文件会失败。
*/
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, relative, resolve, sep, basename } from 'node:path'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useAuthStore } from '../../app/stores/auth'
import { useAuthSession } from '../../app/utils/auth-session'

const projectRoot = resolve(__dirname, '../..')
const read = (rel: string) => readFileSync(resolve(projectRoot, rel), 'utf8')

const ACCESS_TOKEN = 'ssr-payload-access-token'
const REFRESH_TOKEN = 'ssr-payload-refresh-token'

describe('SSR payload never carries credentials', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    useAuthSession().clear()
  })

  it('keeps tokens out of pinia state even while a session is active', () => {
    const pinia = createPinia()
    setActivePinia(pinia)

    const session = useAuthSession()
    session.write({ accessToken: ACCESS_TOKEN, refreshToken: REFRESH_TOKEN })

    const authStore = useAuthStore()
    authStore.user = {
      id: 1,
      username: 'alice',
      avatar: null,
      nickname: null,
      roles: [],
      permissions: []
    }

    // 会话是真实可用的……
    expect(session.accessToken.value).toBe(ACCESS_TOKEN)
    expect(authStore.isAuthenticated).toBe(true)

    // ……但 @pinia/nuxt 序列化进 payload 的 state 里没有任何令牌
    const serializedState = JSON.stringify(pinia.state.value)
    expect(serializedState).not.toContain(ACCESS_TOKEN)
    expect(serializedState).not.toContain(REFRESH_TOKEN)
    expect(Object.keys(pinia.state.value.auth ?? {})).toEqual(['user', 'status'])
  })

  it('drops the session from the store when credentials are cleared elsewhere', () => {
    const session = useAuthSession()
    session.write({ accessToken: ACCESS_TOKEN, refreshToken: REFRESH_TOKEN })

    const authStore = useAuthStore()
    authStore.user = {
      id: 1,
      username: 'alice',
      avatar: null,
      nickname: null,
      roles: [],
      permissions: []
    }
    expect(authStore.isAuthenticated).toBe(true)

    // api 层（refreshAccessTokenOnce 的 401 分支）清令牌时不认识 store，
    // isAuthenticated 必须靠共享的响应式 ref 立即翻转，而不是靠反向通知。
    session.clear()
    expect(authStore.isAuthenticated).toBe(false)
  })
})

describe('auth bootstrap stays client-only', () => {
  it('ships app/plugins/auth.client.ts and no universal counterpart', () => {
    expect(existsSync(resolve(projectRoot, 'app/plugins/auth.client.ts'))).toBe(true)
    expect(existsSync(resolve(projectRoot, 'app/plugins/auth.ts'))).toBe(false)
  })
})

// ---- 公开页组件可达性：从 default layout 与公开页出发，按自动导入规则解析组件引用 ----

const componentFilesByName = (() => {
  const map = new Map<string, string>()
  const visit = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = join(dir, entry.name)
      if (entry.isDirectory()) {
        visit(fullPath)
      } else if (entry.name.endsWith('.vue')) {
        // components: [{ path: '~/components', pathPrefix: false }] → 组件名即文件名
        map.set(basename(entry.name, '.vue'), relative(projectRoot, fullPath).split(sep).join('/'))
      }
    }
  }
  visit(resolve(projectRoot, 'app/components'))
  return map
})()

const publicEntryFiles = () => {
  const files = ['app/layouts/default.vue']
  const visit = (dir: string) => {
    for (const entry of readdirSync(resolve(projectRoot, dir), { withFileTypes: true })) {
      const rel = `${dir}/${entry.name}`
      if (entry.isDirectory()) {
        visit(rel)
      } else if (entry.name.endsWith('.vue')) {
        files.push(rel)
      }
    }
  }
  visit('app/pages/[[language]]')
  return files
}

/** 公开（可缓存）渲染面：从入口文件递归展开组件引用 */
const cacheableSurfaceFiles = () => {
  const seen = new Set<string>()
  const queue = publicEntryFiles()

  while (queue.length) {
    const file = queue.shift() as string
    if (seen.has(file)) {
      continue
    }
    seen.add(file)

    const source = read(file)
    for (const [, tag] of source.matchAll(/<([A-Z][A-Za-z0-9]*)[\s/>]/g)) {
      const referenced = componentFilesByName.get(tag)
      if (referenced && !seen.has(referenced)) {
        queue.push(referenced)
      }
    }
  }

  return [...seen].sort()
}

const templateOf = (source: string) => {
  const start = source.indexOf('<template>')
  return start === -1 ? '' : source.slice(start)
}

/** 计算 <ClientOnly> … </ClientOnly> 覆盖的下标区间（支持嵌套） */
const clientOnlyRanges = (template: string) => {
  const ranges: Array<[number, number]> = []
  const openStack: number[] = []

  for (const match of template.matchAll(/<(\/?)ClientOnly[\s/>]/g)) {
    const index = match.index ?? 0
    if (match[1] === '/') {
      const start = openStack.pop()
      if (start !== undefined) {
        ranges.push([start, index])
      }
    } else {
      openStack.push(index)
    }
  }

  return ranges
}

const SESSION_DEPENDENT_PATTERN = /authStore\.(isAuthenticated|user|status)|\bisAuthenticated\b/g

describe('cacheable surfaces do not render session state on the server', () => {
  it('keeps every session-dependent branch inside <ClientOnly>', () => {
    const offenders = cacheableSurfaceFiles().flatMap((file) => {
      const template = templateOf(read(file))
      if (!template) {
        return []
      }

      const ranges = clientOnlyRanges(template)

      return [...template.matchAll(SESSION_DEPENDENT_PATTERN)]
        .filter((match) => {
          const index = match.index ?? 0
          return !ranges.some(([start, end]) => index > start && index < end)
        })
        .map((match) => `${file} -> ${match[0]}`)
    })

    expect(offenders).toEqual([])
  })

  it('actually reaches the header through the public component graph', () => {
    // 守住上面那条断言的前提：可达性解析真的走到了顶栏
    expect(cacheableSurfaceFiles()).toContain('app/components/layout/AppHeader.vue')
  })
})
