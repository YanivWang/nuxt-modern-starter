export default {
  extends: ['stylelint-config-standard-scss'],
  overrides: [
    {
      files: ['**/*.vue'],
      customSyntax: 'postcss-html'
    },
    {
      files: ['**/*.scss'],
      customSyntax: 'postcss-scss'
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
