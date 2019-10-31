module.exports = {
  parserOptions: {
    ecmaVersion: 2019,
    sourceType: 'module',
  },
  env: {
    es6: true,
    browser: true,
    node: true,
    jest: true,
  },
  plugins: ['prettier', 'svelte3'],
  extends: ['prettier'],
  overrides: [
    {
      files: ['src/**/*.svelte'],
      processor: 'svelte3/svelte3',
    },
  ],
  rules: {
    'no-unused-vars': [
      'error',
      {
        args: 'after-used',
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    'prettier/prettier': 1,
  },
}
