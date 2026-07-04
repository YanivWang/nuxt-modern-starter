import { newsArticles } from '../../config/content/news'
import { localizedPath, publicLocalizedPaths } from '../../config/routes'
import { SUPPORTED_LOCALES } from '../../config/site'

const xmlEscape = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')

export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
  const siteUrl = config.public.siteUrl.replace(/\/$/, '')
  const pagePaths = publicLocalizedPaths()
  const newsPaths = SUPPORTED_LOCALES.flatMap((locale) =>
    newsArticles.map((article) => localizedPath(`/news/${article.slug}`, locale))
  )
  const urls = [...pagePaths, ...newsPaths]

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (path) => `  <url>
    <loc>${xmlEscape(`${siteUrl}${path === '/' ? '' : path}`)}</loc>
  </url>`
  )
  .join('\n')}
</urlset>`
})
