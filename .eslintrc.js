module.exports = {
  env: {
    browser: true,
    // es2021: true,
  },
  extends: [
    'plugin:react/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: [
    'react',
    '@typescript-eslint',
  ],
  rules: {
    'react/jsx-filename-extension': [
      1, { 
        extensions: ['.tsx', '.ts', '.js'],
      },
    ],
    'no-use-before-define': [
      'off', {
        variables: false,
      },
    ],
    'import/extensions': [
      'off'
   ],
  },
};
