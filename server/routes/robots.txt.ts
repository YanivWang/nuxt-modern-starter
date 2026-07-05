import { defineEventHandler, setHeader } from 'h3'
import { useRuntimeConfig } from '#imports'
import { buildRobotsTxt } from '../utils/seo'

export default defineEventHandler((event) => {
  setHeader(event, 'content-type', 'text/plain; charset=utf-8')
  return buildRobotsTxt(useRuntimeConfig(event).public.siteUrl)
})
