import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'dist',
      'public/monaco-editor',
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx,js}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'semi': 'error',
      'object-curly-spacing': ['error', 'always'],
      'no-console': 'warn',
      'quotes': ['error', 'single'],
      'indent': ['error', 2, { SwitchCase: 1 }],
      '@/indent': ['error', 2, { SwitchCase: 1 }],
      'keyword-spacing': 'error',
      'arrow-spacing': ['error', { before: true, after: true }],
      'camelcase': [
        'error',
        {
          'properties': 'never',
        },
      ],
      'space-infix-ops': 'error',
      'comma-dangle': ['error', 'always-multiline'],
      'key-spacing': [
        'error',
        {
          'beforeColon': false,
          'afterColon': true,
        },
      ],
      'comma-spacing': ['error', { before: false, after: true }],
      'no-debugger': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/consistent-type-imports': 'error',
      'react-refresh/only-export-components': 'off',
    },
  },
);
