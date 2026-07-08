export default {
  extends: ['stylelint-config-standard-scss'],
  ignoreFiles: ['**/node_modules/**', '**/.output/**', '**/.nuxt/**'],
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
