import { describe, expect, it } from 'vitest'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
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

  it('keeps en_US static so Rollup does not mix static and dynamic imports', async () => {
    const source = await readFile(join(process.cwd(), 'config/antd-locale.ts'), 'utf8')

    expect(source).toContain("import enUS from 'ant-design-vue/es/locale/en_US'")
    expect(source).not.toContain("import('ant-design-vue/es/locale/en_US')")
  })
})
