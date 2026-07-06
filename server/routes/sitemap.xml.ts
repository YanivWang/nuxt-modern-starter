import { defineEventHandler, setHeader } from 'h3'
import { useRuntimeConfig } from '#imports'
import { buildSitemapXmlAsync } from '../utils/seo'

export default defineEventHandler(async (event) => {
  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  const runtimeConfig = useRuntimeConfig(event)

  return buildSitemapXmlAsync(runtimeConfig.public.siteUrl, runtimeConfig.public.apiBase)
})
