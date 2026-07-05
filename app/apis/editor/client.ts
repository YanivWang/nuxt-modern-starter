import type { AuthApiClientOptions } from '../auth/client'
import { refreshAccessTokenOnce } from '../auth'
import { createAuthApiClient } from '../auth/client'
import { getAuthToken } from '../../utils/auth-session'

export type EditorApiClientOptions = Omit<AuthApiClientOptions, 'refreshAccessToken'>

export const createEditorApiClient = (options: EditorApiClientOptions = {}) =>
  createAuthApiClient({
    ...options,
    accessToken: options.accessToken ?? getAuthToken(),
    refreshAccessToken: refreshAccessTokenOnce
  })
