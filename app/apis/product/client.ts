import type { AuthApiClientOptions } from '../auth/client'
import { refreshAccessTokenOnce } from '../auth'
import { createAuthApiClient } from '../auth/client'
import { getAuthToken } from '../../utils/auth-session'

export type ProductApiClientOptions = Omit<AuthApiClientOptions, 'refreshAccessToken'>

export const createProductApiClient = (options: ProductApiClientOptions = {}) =>
  createAuthApiClient({
    ...options,
    accessToken: options.accessToken ?? getAuthToken(),
    refreshAccessToken: refreshAccessTokenOnce
  })
