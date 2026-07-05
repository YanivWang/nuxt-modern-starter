import { createProductApiClient, type ProductApiClientOptions } from '../product/client'

export type EditorApiClientOptions = ProductApiClientOptions

export const createEditorApiClient = (options: EditorApiClientOptions = {}) =>
  createProductApiClient(options)
