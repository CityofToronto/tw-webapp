module.exports = {
  root: true,
  env: {
    node: true,
  },
  plugins: [
     '@typescript-eslint'
  ],
  extends: [
    'plugin:vue/essential',
    '@vue/prettier',
    '@vue/typescript',
    "plugin:@typescript-eslint/recommended",
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-extra-semi': 'off',
    "no-useless-constructor": "off",
    "indent": "off",
    "import/no-unresolved": "off",
    "import/prefer-default-export": "off",
    "@typescript-eslint/indent": ["off", 2],
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/member-delimiter-style": "off"
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    project: './tsconfig.json',
    ecmaVersion: 2018,
    sourceType: 'module',
    extraFileExtensions: [
      '.vue',
    ],
  },
};
