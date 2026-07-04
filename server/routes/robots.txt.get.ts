export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
  const isProduction = config.appEnv === 'production'

  setHeader(event, 'content-type', 'text/plain; charset=utf-8')

  if (!isProduction) {
    return ['User-agent: *', 'Disallow: /'].join('\n')
  }

  return ['User-agent: *', 'Allow: /', `Sitemap: ${config.public.siteUrl}/sitemap.xml`].join('\n')
})
