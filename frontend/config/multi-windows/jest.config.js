export default {
  globalSetup: '<rootDir>/puppeteer/setup.ts',
  // because it's detected by the default value of testRegex
  // https://jestjs.io/docs/configuration#testregex-string--arraystring
  globalTeardown: '<rootDir>/puppeteer/teardown.ts',
  preset: 'ts-jest',
  rootDir: '../..',
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
