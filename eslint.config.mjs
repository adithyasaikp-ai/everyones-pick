import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'node_modules/**',
      'android/**',
      'ios/**',
      'coverage/**',
      'babel.config.js',
      'metro.config.js',
      'index.js',
    ],
  },
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {argsIgnorePattern: '^_', varsIgnorePattern: '^_'},
      ],
      '@typescript-eslint/consistent-type-imports': 'warn',
    },
  },
);
