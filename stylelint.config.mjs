export default {
  extends: ['stylelint-config-standard-scss'],
  // 构建产物与各类报告目录里的 CSS 不是本项目的源码，必须排除 ——
  // 否则一次 pnpm test:coverage 生成的报告就能让 stylelint 报出几十个「错误」。
  ignoreFiles: [
    '**/node_modules/**',
    '**/.output/**',
    '**/.nuxt/**',
    'coverage/**',
    'playwright-report/**',
    'test-results/**',
    'docs-site/.vitepress/dist/**',
    'docs-site/.vitepress/cache/**'
  ],
  overrides: [
    {
      files: ['**/*.vue'],
      customSyntax: 'postcss-html'
    },
    {
      files: ['**/*.scss'],
      customSyntax: 'postcss-scss'
    },
    {
      files: [
        'app/components/**/*.{vue,scss}',
        'app/features/**/*.{vue,scss}',
        'app/pages/**/*.{vue,scss}',
        'app/layouts/**/*.{vue,scss}'
      ],
      rules: {
        'color-no-hex': [
          true,
          {
            severity: 'error',
            message:
              'Use var(--app-*) design tokens instead of hex colors in product/public UI code.'
          }
        ]
      }
    },
    {
      files: ['app/assets/styles/tokens/**', 'app/assets/styles/patterns/**'],
      rules: {
        'color-no-hex': null
      }
    }
  ],
  rules: {
    'color-hex-length': null,
    'custom-property-empty-line-before': null,
    'selector-class-pattern': null,
    'selector-id-pattern': null,
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['deep', 'global', 'slotted']
      }
    ],
    'scss/dollar-variable-pattern': null,
    'value-keyword-case': null
  }
}
