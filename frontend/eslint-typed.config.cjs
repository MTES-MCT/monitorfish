// Type-aware lint pass, run separately from OxLint.
// OxLint (the primary linter) cannot run type-aware rules here: its tsgolint engine
// requires dropping `baseUrl`, which this codebase's bare-specifier imports rely on.
// This config therefore uses the real TypeScript compiler via @typescript-eslint, and
// only enables a curated set of high-value type-aware rules. It is slow (needs full type
// info), so it is meant for CI / pre-push (`npm run test:lint:types`), not per-save.
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname
  },
  plugins: ['@typescript-eslint'],
  // Severities start at `warn` so this pass is a non-breaking addition: there is an existing
  // backlog (~845 findings) to burn down. Promote rules to `error` as each reaches zero, or
  // gate CI with `--max-warnings` once the count is low enough.
  rules: {
    '@typescript-eslint/await-thenable': 'warn',
    '@typescript-eslint/no-floating-promises': 'warn',
    '@typescript-eslint/no-misused-promises': 'warn',
    '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
    '@typescript-eslint/prefer-nullish-coalescing': 'warn',
    '@typescript-eslint/require-await': 'warn'
  }
};
