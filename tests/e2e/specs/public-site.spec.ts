/*
  【文件职责】
    E2E：公开 SEO 区的路由规范化、多语言 URL、canonical / hreflang 与 SEO server 路由。
    这些断言只有在真实构建产物上才成立 —— prerender / SWR / 301 都是 Nitro 运行时行为。

  【架构位置】
    tests/e2e/specs — Playwright，对 .output preview 服务运行。

  【依赖关系】
    - 依赖：config/site.ts、config/routes.ts、server/routes/*、tests/e2e/stub-api
    - mock：桩后端提供 /content/news 与 /content/pricing（SSR 请求，浏览器拦截不到）

  【边界与注意】
    产品区 URL 语言中性，公开页带语言前缀；两条规则的分界由本文件与 auth.spec.ts 共同守住。
*/
import { expect, test } from '@playwright/test'

test.describe('public site', () => {
  test('serves the prerendered home page with organization structured data', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('.app-nav a').first()).toBeVisible()
    // 根路径的 canonical 不带尾斜杠（absoluteUrl 对 '/' 不追加字符），与 sitemap 写法一致
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'http://127.0.0.1:3000'
    )

    const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents()
    const types = jsonLd.map((raw) => JSON.parse(raw)['@type'])

    expect(types).toContain('Organization')
    expect(types).toContain('WebPage')
  })

  test('emits one hreflang alternate per supported locale plus x-default', async ({ page }) => {
    await page.goto('/pricing')

    const alternates = page.locator('link[rel="alternate"]')
    await expect(alternates).toHaveCount(16)
    await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute(
      'href',
      'http://127.0.0.1:3000/pricing'
    )
  })

  test('renders SSR pricing content fetched from the backend contract', async ({ page }) => {
    await page.goto('/pricing')

    await expect(page.getByText('Simple pricing')).toBeVisible()
    await expect(page.locator('.pricing-card')).toHaveCount(3)
    await expect(page.locator('.pricing-card--featured')).toHaveCount(1)
  })

  test('renders the SWR news list and article detail', async ({ page }) => {
    await page.goto('/news')
    await expect(page.getByText('Starter release')).toBeVisible()

    await page.goto('/news/starter-release')
    const articleLd = await page.locator('script[type="application/ld+json"]').first().textContent()

    expect(JSON.parse(articleLd || '{}')).toMatchObject({
      '@type': 'Article',
      headline: 'Starter release'
    })
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article')
  })

  test('redirects the default-language prefix to the unprefixed canonical path', async ({
    page
  }) => {
    const response = await page.goto('/zh/pricing')

    expect(new URL(page.url()).pathname).toBe('/pricing')
    expect(response?.status()).toBe(200)
  })

  test('strips a trailing slash on a prerendered route', async ({ page }) => {
    // 回归用例：/about 是 prerender 产物，Nitro 会把 /about/ 当静态资源直接命中，
    // 客户端 middleware 的规范化对首屏无效 —— 必须由 server/middleware/canonical-path.ts 兜住
    await page.goto('/about/')

    expect(new URL(page.url()).pathname).toBe('/about')
  })

  test('collapses a stacked trailing slash and locale prefix in one redirect', async ({ page }) => {
    await page.goto('/zh/pricing/')

    expect(new URL(page.url()).pathname).toBe('/pricing')
  })

  test('answers liveness and readiness probes', async ({ request }) => {
    const health = await request.get('/healthz')
    const ready = await request.get('/readyz')

    expect(health.status()).toBe(200)
    expect((await health.json()).status).toBe('ok')
    // 探针不能被缓存，否则实例已经不健康了负载均衡还在拿旧的 200
    expect(health.headers()['cache-control']).toContain('no-store')

    expect(ready.status()).toBe(200)
    expect(await ready.json()).toMatchObject({ status: 'ready', missing: [] })
  })

  test('returns 404 for a locale-shaped prefix that is not supported', async ({ page }) => {
    await page.goto('/xx/pricing')

    await expect(page.locator('.page-eyebrow')).toHaveText('404')
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,nofollow')
  })

  test('switches locale by changing the public URL prefix', async ({ page }) => {
    await page.goto('/pricing')
    await page.locator('.language-switcher__trigger').hover()
    await page.getByRole('menuitem', { name: 'English' }).click()

    await expect(page).toHaveURL(/\/en\/pricing$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  })

  test('exposes robots.txt that blocks the product area and points at the sitemap', async ({
    request
  }) => {
    const robots = await (await request.get('/robots.txt')).text()

    expect(robots).toContain('Disallow: /workspace')
    expect(robots).toContain('Disallow: /docs/')
    expect(robots).toContain('Disallow: /account')
    expect(robots).toContain('Sitemap: http://127.0.0.1:3000/sitemap.xml')
  })

  test('lists only public pages in sitemap.xml', async ({ request }) => {
    const sitemap = await (await request.get('/sitemap.xml')).text()

    expect(sitemap).toContain('<loc>http://127.0.0.1:3000/pricing</loc>')
    expect(sitemap).toContain('<loc>http://127.0.0.1:3000/en/pricing</loc>')
    // 新闻 slug 来自桩后端，证明 sitemap 真的走了动态拉取而不是 fallback
    expect(sitemap).toContain('/news/deployment-guide')
    expect(sitemap).not.toContain('/workspace')
    expect(sitemap).not.toContain('/sign-in')
  })

  test('sets the hardened security response headers', async ({ request }) => {
    const headers = (await request.get('/')).headers()

    expect(headers['x-frame-options']).toBe('DENY')
    expect(headers['x-content-type-options']).toBe('nosniff')
    expect(headers['content-security-policy']).toContain("frame-ancestors 'none'")
  })
})
