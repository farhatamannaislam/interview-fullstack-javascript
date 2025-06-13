module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'], // adjust if needed
    tsconfigRootDir: __dirname,
  },
  plugins: ['react-refresh', '@typescript-eslint', 'react'],
  extends: [
    'eslint:recommended',
    // Upgraded TypeScript rules
    'plugin:@typescript-eslint/recommended-type-checked',
    // or use stricter version:
    // 'plugin:@typescript-eslint/strict-type-checked',

    // Optional stylistic rules
    'plugin:@typescript-eslint/stylistic-type-checked',

    // React rules
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',

    // React Hooks
    'plugin:react-hooks/recommended',
  ],
  settings: {
    react: {
      version: 'detect',
    },
  },
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    // Add any custom rules here
    '@typescript-eslint/prefer-nullish-coalescing': 'off',
  },
};
