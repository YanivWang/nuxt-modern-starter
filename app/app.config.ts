import { DEFAULT_THEME_MODE } from '../config/theme'

export default defineAppConfig({
  brand: {
    name: 'Nuxt Modern Starter',
    tagline: 'Modern Nuxt starter for public websites'
  },
  layout: {
    showHeader: true,
    showFooter: true
  },
  theme: {
    defaultMode: DEFAULT_THEME_MODE
  }
})
