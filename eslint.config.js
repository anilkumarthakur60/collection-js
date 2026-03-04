import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import perfectionist from 'eslint-plugin-perfectionist';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      perfectionist,
    },
    rules: {
      'perfectionist/sort-interfaces': 'error',
    },
  },
  {
    ignores: [
      ".gitignore",
      ".vitepress/**",
      "docs/.vitepress/**",
      "dist/**",
      "coverage/**",
      "tests/**",
      "node_modules/**"
    ]
  }
);
