import { getRequestURL, sendRedirect } from 'h3'
import { localizedProductPathToCanonical } from '../../config/routes'

export default defineEventHandler((event) => {
  const requestUrl = getRequestURL(event)
  const canonicalPath = localizedProductPathToCanonical(requestUrl.pathname)

  if (!canonicalPath) {
    return
  }

  return sendRedirect(event, `${canonicalPath}${requestUrl.search}`, 301)
})
