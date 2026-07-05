import { defineEventHandler, getRequestURL, sendRedirect } from 'h3'

const legacyWorkspaceEditPath = /^\/app\/workspace\/([^/]+)\/edit$/

export default defineEventHandler((event) => {
  const requestUrl = getRequestURL(event)
  const match = requestUrl.pathname.match(legacyWorkspaceEditPath)

  if (!match) {
    return
  }

  return sendRedirect(event, `/app/docs/${match[1]}${requestUrl.search}`, 301)
})
