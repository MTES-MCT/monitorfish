export default {
  globalSetup: '<rootDir>/puppeteer/setup.ts',
  // because it's detected by the default value of testRegex
  // https://jestjs.io/docs/configuration#testregex-string--arraystring
  globalTeardown: '<rootDir>/puppeteer/teardown.ts',
  // All the spec files drive the same two browsers, they cannot run in parallel
  maxWorkers: 1,
  preset: 'ts-jest',
  rootDir: '../..',
  setupFilesAfterEnv: ['<rootDir>/puppeteer/setupAfterEnv.ts'],
  testEnvironment: '<rootDir>/puppeteer/puppeteer_environment.ts',
  testMatch: ['<rootDir>/puppeteer/e2e/*.spec.ts'],
  transform: {
    '.ts': [
      'ts-jest',
      {
        isolatedModules: true,
        useESM: true
      }
    ]
  }
}
