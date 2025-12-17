import globals from 'globals';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettier from 'eslint-plugin-prettier/recommended';
import { defineConfig, globalIgnores } from 'eslint/config';

const customRules = {
  // Helps with cleaning debug statements by erroring on console.
  'no-console': 'error',
  // It's no longer needed to import React, so this just prevents weird
  // errors when you don't.
  'react/react-in-jsx-scope': 'off',
  // Array indexes as keys should not be used. The occasional time it is
  // needed, an ignore can be added.
  'react/no-array-index-key': 'error',
  // Helps with enforcing rules of hooks. Very helpful to catch wrongly
  // placed hooks, like conditional usage.
  'react-hooks/rules-of-hooks': 'error',
  // Ensure that components are PascalCase
  'react/jsx-pascal-case': 'error',
  // Force self closing components when there are no children.
  // Prevents `<MyComp prop='1'></MyComp>`
  'react/self-closing-comp': 'error',
};

export default defineConfig([
  globalIgnores(['dist', 'node_modules', 'build', 'coverage']),
  js.configs.recommended,
  react.configs.flat.recommended,
  prettier,
  // JS/JSX config
  {
    files: ['**/*.{js,jsx,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: { ...globals.browser, process: 'readonly' },
    },
    settings: { react: { version: 'detect' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...customRules,
      'no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  // TS/TSX config
  {
    files: ['**/*.{ts,tsx}'],
    extends: [...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
      ecmaVersion: 2020,
      globals: { ...globals.browser, process: 'readonly' },
    },
    settings: { react: { version: 'detect' } },
    plugins: {
      ...tseslint.plugins,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...customRules,
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      // TODO: Consider making these errors in the future (use recommendedTypeChecked rules!).
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-enum-comparison': 'warn',
    },
  },
]);
