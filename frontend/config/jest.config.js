module.exports = {
  clearMocks: true,
  //   collectCoverageFrom: ['{api,app,common}/{helpers,hooks,libs}/**/*.ts'],
  globalSetup: '<rootDir>/config/jest.global.js',
  maxWorkers: '50%',
  rootDir: '..',
  setupFiles: ['dotenv/config'],
  testEnvironment: 'jsdom',
  testMatch: ['**/*.test.{j,t}{s,sx}'],
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
    ]
  },
  transformIgnorePatterns: ['node_modules/(?!@codemirror)/']
}
