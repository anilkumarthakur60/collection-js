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
      "docs/.vitepress/cache/**",
      "docs/.vitepress/dist/**",
      "docs/.vitepress/theme/**",
      "dist/**",
      "coverage/**"
    ]
  }
);
