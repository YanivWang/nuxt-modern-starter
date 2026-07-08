import { describe, expect, it } from 'vitest'
import { SUPPORTED_LOCALES } from '../../config/site'
import { getAntdLocale } from '../../config/antd-locale'

describe('Ant Design Vue locale mapping', () => {
  it('provides component locale data for every supported app locale', () => {
    SUPPORTED_LOCALES.forEach((locale) => {
      expect(getAntdLocale(locale), locale).toMatchObject({
        locale: expect.any(String)
      })
    })
  })
})
