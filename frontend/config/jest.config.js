module.exports = {
  clearMocks: true,
  collectCoverageFrom: ['**/{hooks,libs,utils}/**/*.ts', '**/utils.ts'],
  globalSetup: '<rootDir>/config/jest.global.js',
  maxWorkers: '50%',
  rootDir: '..',
  setupFiles: ['dotenv/config'],
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/**/*.test.{j,t}{s,sx}'],
  transform: {
    '.*\\.(j|t)sx?$': [
      '@swc/jest',
      {
        jsc: {
          transform: {
            react: {
              runtime: 'automatic',
            },
          },
        },
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!@codemirror)/'],
}
