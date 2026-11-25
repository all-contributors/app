import js from '@eslint/js';
import markdown from '@eslint/markdown';
import vitestPlugin from '@vitest/eslint-plugin';
import { importX } from 'eslint-plugin-import-x';
import jsonc from 'eslint-plugin-jsonc';
import packageJson from 'eslint-plugin-package-json';
import perfectionist from 'eslint-plugin-perfectionist';
import yml from 'eslint-plugin-yml';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';

export default defineConfig([
  globalIgnores(['coverage/**', 'dist/**', '.all-contributorsrc', 'CHANGELOG*', 'pnpm-lock.yaml']),
  { linterOptions: { reportUnusedDisableDirectives: 'error' } },
  {
    extends: [js.configs.recommended, importX.flatConfigs.recommended],
    files: ['**/*.{mjs,js}'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.node,
    },
    plugins: { perfectionist },
    rules: {
      'import-x/no-unresolved': 'error',
      'import-x/no-extraneous-dependencies': 'error',
      'import-x/no-named-as-default-member': 'off',
      'no-unused-vars': ['error', { ignoreRestSiblings: true }],
      'perfectionist/sort-exports': 'error',
      'perfectionist/sort-named-exports': 'error',
      'perfectionist/sort-named-imports': 'error',
    },
    settings: { perfectionist: { partitionByComment: true, type: 'natural' } },
  },
  {
    extends: [vitestPlugin.configs.recommended],
    files: ['**/__tests__/**/*.js'],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      'vitest/prefer-to-have-length': 'error',
    },
  },
  {
    extends: [jsonc.configs['flat/recommended-with-json']],
    files: ['**/*.json'],
  },
  {
    extends: [packageJson.configs.recommended, packageJson.configs.stylistic],
    files: ['package.json'],
    rules: {
      // TODO: Tech debt that we'll want to address in the future.
      // https://github.com/all-contributors/app/issues/637
      'package-json/require-exports': 'off',
    },
  },
  {
    extends: [markdown.configs.recommended],
    files: ['**/*.md'],
    rules: {
      // https://github.com/eslint/markdown/issues/294
      'markdown/no-missing-label-refs': 'off',
    },
  },
  {
    extends: [yml.configs['flat/standard'], yml.configs['flat/prettier']],
    files: ['**/*.{yml,yaml}'],
    rules: {
      'yml/file-extension': ['error', { extension: 'yml' }],
      'yml/sort-sequence-values': ['error', { order: { type: 'asc' }, pathPattern: '^.*$' }],
    },
  },
  {
    files: ['pnpm-workspace.yaml'],
    rules: {
      'yml/file-extension': 'off',
      'yml/sort-keys': ['error', { order: { type: 'asc' }, pathPattern: '^.*$' }],
    },
  },
]);
