/*
  【文件职责】
    单测：usePageSeo 纯函数 buildPageSeoLinks/Meta/Scripts（hreflang、noindex、JSON-LD）。

  【架构位置】
    tests/unit — 不 mount 组件、不调用 useHead。

  【主要导出 / 路由】
    describe page seo links / meta / scripts

  【依赖关系】
    - 依赖：app/composables/usePageSeo.ts、config/site.ts
    - mock：无

  【渲染 / 数据】
    无

  【边界与注意】
    不覆盖 usePageSeo composable 与 useLanguageStore 集成；noindex 无 hreflang 必测。
*/
import { describe, expect, it } from 'vitest'
import {
  buildPageSeoLinks,
  buildPageSeoMeta,
  buildPageSeoScripts
} from '../../app/composables/usePageSeo'
import { SITE_NAME, SITE_ORG } from '../../config/site'

const siteUrl = 'https://example.com'
const resolvedTitle = 'Pricing · Nuxt Modern Starter'
const resolvedDescription = 'Transparent pricing for teams.'
const canonical = 'https://example.com/pricing'
const ogImage = 'https://example.com/og-default.png'

describe('page seo links', () => {
  it('generates alternate language links for public pages', () => {
    const links = buildPageSeoLinks({
      siteUrl,
      path: '/pricing',
      locale: 'zh-CN'
    })

    expect(links).toContainEqual({ rel: 'canonical', href: 'https://example.com/pricing' })
    expect(links).toContainEqual({
      rel: 'alternate',
      hreflang: 'zh-CN',
      href: 'https://example.com/pricing'
    })
    expect(links).toContainEqual({
      rel: 'alternate',
      hreflang: 'en-US',
      href: 'https://example.com/en/pricing'
    })
    expect(links).toContainEqual({
      rel: 'alternate',
      hreflang: 'x-default',
      href: 'https://example.com/pricing'
    })
  })

  it('does not generate alternate language links for noindex product pages', () => {
    const links = buildPageSeoLinks({
      siteUrl,
      path: '/workspace',
      locale: 'en-US',
      noindex: true
    })

    expect(links).toEqual([{ rel: 'canonical', href: 'https://example.com/workspace' }])
  })
})

describe('page seo meta', () => {
  it('outputs twitter and open graph tags with resolved title and description', () => {
    const meta = buildPageSeoMeta({
      siteUrl,
      siteName: SITE_NAME,
      title: resolvedTitle,
      description: resolvedDescription,
      canonical,
      ogImage,
      locale: 'zh-CN'
    })

    expect(meta).toContainEqual({ property: 'og:title', content: resolvedTitle })
    expect(meta).toContainEqual({ property: 'og:description', content: resolvedDescription })
    expect(meta).toContainEqual({ property: 'og:type', content: 'website' })
    expect(meta).toContainEqual({ property: 'og:site_name', content: SITE_NAME })
    expect(meta).toContainEqual({ name: 'twitter:card', content: 'summary_large_image' })
    expect(meta).toContainEqual({ name: 'twitter:title', content: resolvedTitle })
    expect(meta).toContainEqual({ name: 'twitter:description', content: resolvedDescription })
    expect(meta).toContainEqual({ name: 'twitter:image', content: ogImage })
  })

  it('uses article og:type and keeps twitter/og metadata on noindex pages', () => {
    const meta = buildPageSeoMeta({
      siteUrl,
      siteName: SITE_NAME,
      title: resolvedTitle,
      description: resolvedDescription,
      canonical,
      ogImage,
      locale: 'en-US',
      noindex: true,
      article: {
        title: 'Release notes',
        description: 'What changed',
        publishedAt: '2026-01-01T00:00:00.000Z'
      }
    })

    expect(meta).toContainEqual({ property: 'og:type', content: 'article' })
    expect(meta).toContainEqual({ name: 'robots', content: 'noindex,nofollow' })
    expect(meta).toContainEqual({ name: 'twitter:title', content: resolvedTitle })
  })

  it('outputs site verification meta when tokens are provided', () => {
    const meta = buildPageSeoMeta({
      siteUrl,
      siteName: SITE_NAME,
      title: resolvedTitle,
      description: resolvedDescription,
      canonical,
      ogImage,
      locale: 'zh-CN',
      siteVerification: {
        google: 'google-token',
        baidu: 'baidu-token'
      }
    })

    expect(meta).toContainEqual({ name: 'google-site-verification', content: 'google-token' })
    expect(meta).toContainEqual({ name: 'baidu-site-verification', content: 'baidu-token' })
  })
})

describe('page seo scripts', () => {
  const article = {
    title: 'Starter release',
    description: 'Initial release notes',
    publishedAt: '2026-01-01T00:00:00.000Z'
  }

  it('outputs article json-ld with canonical mainEntityOfPage', () => {
    const scripts = buildPageSeoScripts({
      siteUrl,
      canonical: 'https://example.com/news/starter-release',
      article
    })

    expect(scripts).toHaveLength(1)
    expect(JSON.parse(scripts[0].innerHTML)).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: article.description,
      datePublished: article.publishedAt,
      mainEntityOfPage: 'https://example.com/news/starter-release'
    })
  })

  it('outputs webpage and organization json-ld for the home page opt-in', () => {
    const scripts = buildPageSeoScripts({
      siteUrl,
      canonical: 'https://example.com',
      title: resolvedTitle,
      description: resolvedDescription,
      webPage: true,
      includeOrganization: true
    })

    expect(scripts).toHaveLength(2)
    expect(JSON.parse(scripts[0].innerHTML)).toEqual({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: resolvedTitle,
      description: resolvedDescription,
      url: 'https://example.com'
    })
    expect(JSON.parse(scripts[1].innerHTML)).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: SITE_ORG.name,
      url: 'https://example.com',
      logo: 'https://example.com/og-default.png'
    })
  })

  it('can stack article and webpage json-ld together', () => {
    const scripts = buildPageSeoScripts({
      siteUrl,
      canonical: 'https://example.com/news/starter-release',
      title: resolvedTitle,
      description: resolvedDescription,
      article,
      webPage: true
    })

    expect(scripts).toHaveLength(2)
    expect(JSON.parse(scripts[0].innerHTML)['@type']).toBe('Article')
    expect(JSON.parse(scripts[1].innerHTML)['@type']).toBe('WebPage')
  })

  it('returns an empty script array when no json-ld opt-in is requested', () => {
    expect(
      buildPageSeoScripts({
        siteUrl,
        canonical
      })
    ).toEqual([])
  })
})
