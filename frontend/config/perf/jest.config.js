// Performance budgets measured in a real Chrome (CDP: network, CPU throttling, long animation frames).
// They run against a production build served on `PERF_BASE_URL`, logged in as a non-super-user (see `puppeteer/perf/README.md`).
export default {
  maxWorkers: 1,
  rootDir: '../..',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/puppeteer/perf/*.spec.ts'],
  testTimeout: 180 * 1000,
  transform: {
    '.ts': ['@swc/jest', { jsc: { parser: { syntax: 'typescript' } } }]
  }
}
