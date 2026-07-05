import { createAuthenticatedApiHeaders, requestScenarioApi, type ApiOptions } from './useApi'
import { getAuthToken } from '../utils/auth-session'

export const useEditorApi = <T>(path: string, options: ApiOptions<T> = {}) => {
  const token = options.token || getAuthToken()
  const headers = createAuthenticatedApiHeaders(token, options.headers)

  return requestScenarioApi('editor', path, options, headers, true)
}
