// See `puppeteer/perf/README.md`
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
