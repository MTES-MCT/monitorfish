module.exports = {
  clearMocks: true,
  collectCoverageFrom: ['**/{hooks,libs,utils}/**/*.t{s,sx}', '**/utils.ts'],
  globalSetup: '<rootDir>/config/jest.global.js',
  maxWorkers: '50%',
  rootDir: '..',
  setupFiles: ['dotenv/config'],
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/**/*.test.t{s,sx}'],
  transform: {
    '.*\\.(j|t)sx?$': [
      '@swc/jest',
      {
        jsc: {
          transform: {
            react: {
              runtime: 'automatic'
            }
          }
        }
      }
    ],
    '\\.svg$': '<rootDir>/config/fileTransformer.js'
  },
  transformIgnorePatterns: ['node_modules/(?!@codemirror)/']
}
