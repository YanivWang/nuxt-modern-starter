export type ApiResponse<T> = {
  code: number
  message: string
  data: T
}

export type FlatApiResponse = {
  code: number
  msg?: string
  message?: string
}

export type NormalizedFlatApiResponse<T extends FlatApiResponse> = Omit<T, 'msg' | 'message'> & {
  code: number
  message: string
}

export const normalizeFlatApiResponse = <T extends FlatApiResponse>(
  response: T
): NormalizedFlatApiResponse<T> => {
  const { msg, message, ...rest } = response

  return {
    ...rest,
    message: message || msg || ''
  } as NormalizedFlatApiResponse<T>
}
