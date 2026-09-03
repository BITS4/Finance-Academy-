import eslint from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import { defineConfig, globalIgnores } from 'eslint/config';
import reactHooks from 'eslint-plugin-react-hooks';
import react from 'eslint-plugin-react';
import globals from 'globals';

const sourceFiles = ['**/*.{js,jsx,ts,tsx,mjs}'];

export default defineConfig([
  globalIgnores(['node_modules/**', '.expo/**', 'dist/**', 'coverage/**']),
  eslint.configs.recommended,
  {
    files: sourceFiles,
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2024,
        __DEV__: 'readonly',
      },
    },
    plugins: { react, 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.flat.recommended.rules,
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      'no-console': 'error',
      'max-lines': ['error', { max: 500, skipBlankLines: true, skipComments: true }],
      'react-hooks/exhaustive-deps': 'error',
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { parser: typescriptParser },
    plugins: { '@typescript-eslint': typescriptEslint },
    rules: {
      'no-unused-vars': 'off',
      'no-undef': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: ['**/*.{spec,test}.{js,jsx,ts,tsx}'],
    rules: { 'max-lines': 'off' },
  },
]);
