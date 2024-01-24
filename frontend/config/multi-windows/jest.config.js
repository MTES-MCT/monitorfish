module.exports = {
  rootDir: '../..',
  globalSetup: "<rootDir>/puppeteer/setup.ts",
  testEnvironment: '<rootDir>/puppeteer/puppeteer_environment.ts',
  // because it's detected by the default value of testRegex
  // https://jestjs.io/docs/configuration#testregex-string--arraystring
  globalTeardown: "<rootDir>/puppeteer/teardown.ts",
  testMatch: ['<rootDir>/puppeteer/e2e/*.spec.ts'],
  preset: "ts-jest",
  transform: {
    ".ts": [
      "ts-jest",
      {
        isolatedModules: true,
        useESM: true,
      }
    ]
  }
}
