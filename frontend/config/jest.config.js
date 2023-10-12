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
            optimizer: {
              globals: {
                vars: {
                  'import.meta.env': 'process.env'
                }
              }
            },
            react: {
              runtime: 'automatic'
            }
          }
        }
      }
    ],
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/config/fileTransformer.js'
  },
  transformIgnorePatterns: ['node_modules/(?!ol)/']
}
