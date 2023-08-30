module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: 'standard-with-typescript',
  ignorePatterns: [
    '.eslintrc.js',
    '**/*.config.js',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json'
  },
  rules: {
    '@typescript-eslint/no-misused-promises': 'off',
    '@typescript-eslint/consistent-type-imports': 'off'
  }
}
