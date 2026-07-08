import { describe, expect, it } from 'vitest'
import { SUPPORTED_LOCALES } from '../../config/site'
import { loadAntdLocale } from '../../config/antd-locale'

describe('Ant Design Vue locale mapping', () => {
  it('provides component locale data for every supported app locale', async () => {
    await Promise.all(
      SUPPORTED_LOCALES.map(async (locale) => {
        expect(await loadAntdLocale(locale), locale).toMatchObject({
          locale: expect.any(String)
        })
      })
    )
  })
})
