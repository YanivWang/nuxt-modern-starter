import { createPublicApiHeaders, requestScenarioApi, type ApiOptions } from './useApi'

export const usePublicApi = <T>(path: string, options: ApiOptions<T> = {}) =>
  requestScenarioApi('public', path, options, createPublicApiHeaders(options.headers), false)
