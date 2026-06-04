import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import perfectionist from 'eslint-plugin-perfectionist'
import prettier from 'eslint-config-prettier'
import globals from 'globals'

const IGNORE_UNDERSCORE = { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/coverage/**',
      '**/node_modules/**',
      '**/docs/**',
      '**/.changeset/**',
      '**/*.config.ts',
      '**/*.config.js'
    ]
  },

  eslint.configs.recommended,

  // Library source: type-aware rules (bans any, unsafe assignments, floating
  // promises) — the bar the other @anil-labs packages hold.
  {
    files: ['packages/*/src/**/*.ts'],
    extends: [...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    },
    plugins: { perfectionist },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', IGNORE_UNDERSCORE],
      'perfectionist/sort-interfaces': 'error'
    }
  },

  // Tests and examples (incl. plain .mjs/.js): fast, non-type-aware linting,
  // with Node + browser globals available.
  {
    files: ['packages/*/test/**/*.ts', 'examples/**/*.{ts,mjs,js}'],
    extends: [...tseslint.configs.recommended],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser }
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', IGNORE_UNDERSCORE],
      'no-undef': 'off'
    }
  },

  prettier
)
