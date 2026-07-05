import { buildSitemapXml } from '../utils/seo'

export default defineEventHandler((event) => {
  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return buildSitemapXml(useRuntimeConfig(event).public.siteUrl)
})
