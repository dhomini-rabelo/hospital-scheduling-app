import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import importHelpers from 'eslint-plugin-import-helpers'
import prettier from 'eslint-plugin-prettier'
import vitestGlobals from 'eslint-plugin-vitest-globals'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

export default [
  ...compat.extends('@rocketseat/eslint-config/node'),
  {
    files: ['./**/*.{ts}'],
    plugins: {
      '@typescript-eslint': typescriptEslint,
      'import-helpers': importHelpers,
      'vitest-globals': vitestGlobals,
      prettier,
    },
    languageOptions: {
      parser: tsParser,
      globals: {
        ...vitestGlobals.environments.env.globals,
      },
    },
    rules: {
      'no-useless-constructor': 'off',
      'import-helpers/order-imports': [
        'warn',
        {
          newlinesBetween: 'always',
          groups: [
            ['/^@domain/', '/^@layer/', '/^@infra/', '/^@modules/'],
            ['parent', 'sibling', 'index'],
            'module',
          ],
          alphabetize: { order: 'asc', ignoreCase: true },
        },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      quotes: ['error', 'single'],
      'no-template-curly-in-string': 'off',
      '@typescript-eslint/no-duplicate-enum-values': 'off',
      'linebreak-style': ['error', 'unix'],
      '@typescript-eslint/triple-slash-reference': 'off',
    },
  },
]
